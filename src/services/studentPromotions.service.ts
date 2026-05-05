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
    sectionId: number
    sessionId: number
    divisionId: number
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
    rollNo: number | null
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
        sectionId,
        sessionId,
        divisionId,
        currentResult,
        nextSession,
      } = studentData

      // 1️⃣ Fetch student basic info + current academic data
      const [student] = await tx
        .select({
          firstName: studentsModel.firstName,
          lastName: studentsModel.lastName,
          rollNo: studentsModel.rollNo,
          classId: studentsModel.classId,
          sectionId: studentsModel.sectionId,
          sessionId: studentsModel.sessionId,
          divisionId: studentsModel.divisionId,
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

      // 2️⃣ Check fees status
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
          message: `All fees of previous session is not paid`,
        })
        continue
      }

      /** ------------------------------------------------
       * Promote Student
       * ------------------------------------------------ */

      // 3️⃣ Merge new + old values (IMPORTANT PART)
      const updatedClassId = classId ?? student.classId
      const updatedSectionId = sectionId ?? student.sectionId
      const updatedSessionId = sessionId ?? student.sessionId
      const updatedDivisionId = divisionId ?? student.divisionId

      // 4️⃣ Update student
      await tx
        .update(studentsModel)
        .set({
          classId: updatedClassId,
          sectionId: updatedSectionId,
          sessionId: updatedSessionId,
          divisionId: updatedDivisionId,
        })
        .where(eq(studentsModel.studentId, studentId))

      // 5️⃣ Delete old student fees
      if (feesRecords.length > 0) {
        await tx
          .delete(studentFeesModel)
          .where(eq(studentFeesModel.studentId, studentId))
      }

      // 6️⃣ Insert new student fees
      for (const feesMasterId of feesMasterIds) {
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

      // 7️⃣ Insert promotion record
      await tx.insert(studentPromotionModel).values({
        studentId,
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
