import { eq, sql } from 'drizzle-orm'
import { db } from '../config/database'
import {
  classesModel,
  feesMasterModel,
  feesTypeModel,
  sectionsModel,
  studentFeesModel,
  studentPaymentsModel,
  studentsModel,
} from '../schemas'

export const collectFees = async (payload: any | any[]) => {
  const payments = Array.isArray(payload) ? payload : [payload]

  const results = []

  for (const body of payments) {
    const {
      studentFeesId,
      studentId,
      paidAmount,
      method,
      bankAccountId,
      mfsId,
      paymentDate,
      remarks,
    } = body

    console.log('➡️ Processing student:', studentId)

    if (!studentFeesId) throw new Error('studentFeesId is required')
    if (!method) throw new Error('payment method is required')
    if (!paymentDate) throw new Error('paymentDate is required')

    const feeRecord = await db
      .select({
        amount: studentFeesModel.amount,
        paidAmount: studentFeesModel.paidAmount,
      })
      .from(studentFeesModel)
      .where(eq(studentFeesModel.studentFeesId, studentFeesId))
      .then((res) => res[0])

    if (!feeRecord) {
      throw new Error(`Fee record not found: ${studentFeesId}`)
    }

    const student = await db
      .select({
        classId: studentsModel.classId,
        sectionId: studentsModel.sectionId,
        sessionId: studentsModel.sessionId,
        divisionId: studentsModel.divisionId,
      })
      .from(studentsModel)
      .where(eq(studentsModel.studentId, studentId))
      .then((res) => res[0])

    console.log('👤 Student data:', student)

    if (!student?.divisionId) {
      throw new Error(`Missing divisionId for student ${studentId}`)
    }

    const finalPaidAmount = (feeRecord.paidAmount || 0) + paidAmount

    if (finalPaidAmount > feeRecord.amount) {
      throw new Error('Total paid amount cannot exceed fee amount')
    }

    const remainingAmount = feeRecord.amount - finalPaidAmount
    const status = remainingAmount === 0 ? 'Paid' : 'Partial'

    await db
      .update(studentFeesModel)
      .set({
        paidAmount: finalPaidAmount,
        remainingAmount,
        status,
        updatedAt: new Date(),
      })
      .where(eq(studentFeesModel.studentFeesId, studentFeesId))

    console.log('💾 Inserting payment for:', studentId)

    await db.insert(studentPaymentsModel).values({
      studentFeesId,
      studentId,
      divisionId: student.divisionId, // ✅ REQUIRED NOW
      classId: student.classId || null,
      sectionId: student.sectionId || null,
      sessionId: student.sessionId,
      method,
      bankAccountId: bankAccountId || null,
      mfsId: mfsId || null,
      paymentDate: new Date(paymentDate),
      paidAmount,
      remarks: remarks || null,
      createdAt: new Date(),
    })

    results.push({
      studentFeesId,
      paidAmount,
      remainingAmount,
      status,
    })
  }

  return Array.isArray(payload) ? results : results[0]
}

export const getStudentFeesById = async (studentId: number) => {
  if (!studentId) {
    throw new Error('studentId is required')
  }

  const fees = await db
    .select({
      studentFeesId: studentFeesModel.studentFeesId,
      studentId: studentFeesModel.studentId,
      studentName: sql`CONCAT(${studentsModel.firstName}, ' ', ${studentsModel.lastName})`,
      photoUrl: studentsModel.photoUrl,
      classId: studentsModel.classId,
      className: classesModel.className,
      sectionName: sectionsModel.sectionName,
      phoneNumber: studentsModel.phoneNumber,
      gender: studentsModel.gender,
      admissionNo: studentsModel.admissionNo,
      rollNo: studentsModel.rollNo,
      amount: studentFeesModel.amount,
      paidAmount: studentFeesModel.paidAmount,
      remainingAmount: studentFeesModel.remainingAmount,
      status: studentFeesModel.status,
      feesMasterId: studentFeesModel.feesMasterId,
      feesTypeId: feesMasterModel.feesTypeId,
      feesTypeName: feesTypeModel.typeName,
      dueDate: feesMasterModel.dueDate,
      paymentMethod: studentPaymentsModel.method,
      paymentDate: studentPaymentsModel.paymentDate,
      paymentRemarks: studentPaymentsModel.remarks,
    })
    .from(studentFeesModel)
    .leftJoin(
      studentsModel,
      eq(studentFeesModel.studentId, studentsModel.studentId)
    )
    .leftJoin(classesModel, eq(studentsModel.classId, classesModel.classId))
    .leftJoin(
      sectionsModel,
      eq(studentsModel.sectionId, sectionsModel.sectionId)
    )
    .leftJoin(
      feesMasterModel,
      eq(studentFeesModel.feesMasterId, feesMasterModel.feesMasterId)
    )
    .leftJoin(
      feesTypeModel,
      eq(feesMasterModel.feesTypeId, feesTypeModel.feesTypeId)
    )
    .leftJoin(
      studentPaymentsModel,
      eq(studentFeesModel.studentFeesId, studentPaymentsModel.studentFeesId)
    )
    .where(eq(studentFeesModel.studentId, studentId))

  return fees
}
