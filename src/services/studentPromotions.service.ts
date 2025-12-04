import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  feesMasterModel,
  studentFeesModel,
  studentPromotionModel,
  studentsModel,
} from '../schemas'

interface PromoteRequest {
  students: {
    studentId: number
    classId: number
    secitionId: number
    sessionId: number
    currentResult: 'Pass' | 'Fail'
    nextSession: 'Continue' | 'Leave'
  }[]
  feesMasterIds: number[]
}

interface PromotionResult {
  promotedStudents: any[]
  notPromotedStudents: {
    studentId: number
    studentName: string
    rollNo: number
    message: string
  }[]
}

export const promoteStudents = async (
  input: PromoteRequest
): Promise<PromotionResult> => {
  const { students, feesMasterIds } = input

  const promotedStudents: any[] = []
  const notPromotedStudents: PromotionResult['notPromotedStudents'] = []

  await db.transaction(async (tx) => {
    for (const studentData of students) {
      const {
        studentId,
        classId,
        secitionId,
        sessionId,
        currentResult,
        nextSession,
      } = studentData

      // Fetch student info
      const [student] = await tx
        .select({
          firstName: studentsModel.firstName,
          lastName: studentsModel.lastName,
          rollNo: studentsModel.rollNo,
        })
        .from(studentsModel)
        .where(eq(studentsModel.studentId, studentId))

      if (!student) {
        notPromotedStudents.push({
          studentId,
          studentName: 'Unknown',
          rollNo: 0,
          message: `Student not found`,
        })
        continue
      }

      const studentName = `${student.firstName} ${student.lastName}`

      // Fetch student fees
      const feesRecords = await tx
        .select()
        .from(studentFeesModel)
        .where(eq(studentFeesModel.studentId, studentId))

      const allPaid =
        feesRecords.length > 0 && feesRecords.every((f) => f.status === 'Paid')

      if (!allPaid) {
        notPromotedStudents.push({
          studentId,
          studentName,
          rollNo: student.rollNo,
          message: `All fees of this session is not paid of name: ${studentName}, roll: ${student.rollNo}`,
        })
        continue
      }

      /** ------------------------------------------------
       * Promote Student
       * ------------------------------------------------ */
      // 1️⃣ Update class + section
      await tx
        .update(studentsModel)
        .set({ classId, sectionId: secitionId })
        .where(eq(studentsModel.studentId, studentId))

      // 2️⃣ Delete old student fees (all)
      if (feesRecords.length > 0) {
        await tx
          .delete(studentFeesModel)
          .where(eq(studentFeesModel.studentId, studentId))
      }

      // 3️⃣ Insert new student fees from feesMasterIds
      for (const feesMasterId of feesMasterIds) {
        // Fetch fee amount from feesMasterModel
        const [feeMaster] = await tx
          .select({ amount: feesMasterModel.amount })
          .from(feesMasterModel)
          .where(eq(feesMasterModel.feesMasterId, feesMasterId))

        if (!feeMaster) {
          throw new Error(`feesMasterId ${feesMasterId} not found`)
        }

        await tx.insert(studentFeesModel).values({
          studentId,
          feesMasterId,
          amount: feeMaster.amount,
          paidAmount: 0,
          remainingAmount: feeMaster.amount,
          status: 'Unpaid',
        })
      }

      // 4️⃣ Insert promotion record
      await tx.insert(studentPromotionModel).values({
        studentId,
        sessionId,
        currentResult,
        nextSession,
      })

      promotedStudents.push({
        studentId,
        studentName,
        rollNo: student.rollNo,
      })
    }
  })

  return { promotedStudents, notPromotedStudents }
}
