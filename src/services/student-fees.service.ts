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

export const collectFees = async (body: any) => {
  const { studentFeesId, paidAmount, method, bankAccountId, phoneNumber, paymentDate, remarks } = body

  if (!studentFeesId) throw new Error('studentFeesId is required')
  if (!paidAmount || paidAmount <= 0) throw new Error('paidAmount is required')
  if (!method) throw new Error('payment method is required')
  if (!paymentDate) throw new Error('paymentDate is required')

  // Fetch current student fee record
  const feeRecord = await db
    .select({
      amount: studentFeesModel.amount,
      paidAmount: studentFeesModel.paidAmount,
      remainingAmount: studentFeesModel.remainingAmount,
    })
    .from(studentFeesModel)
    .where(eq(studentFeesModel.studentFeesId, studentFeesId))
    .then((res) => res[0])

  if (!feeRecord) {
    throw new Error(`Fee record not found for ID ${studentFeesId}`)
  }

  // Existing paid + new paid
  const updatedPaidAmount = (feeRecord.paidAmount || 0) + paidAmount

  if (updatedPaidAmount > feeRecord.amount) {
    throw new Error(`Total paid amount cannot exceed total fee amount.`)
  }

  const newRemainingAmount = feeRecord.amount - updatedPaidAmount

  // Auto-detect status
  const newStatus: 'Paid' | 'Partial' =
    newRemainingAmount === 0 ? 'Paid' : 'Partial'

  // 🔄 Update student_fees
  await db
    .update(studentFeesModel)
    .set({
      paidAmount: updatedPaidAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(studentFeesModel.studentFeesId, studentFeesId))

  // ➕ Insert into student_payments
  await db.insert(studentPaymentsModel).values({
    studentFeesId,
    method,
    bankAccountId: bankAccountId || null,
    phoneNumber: phoneNumber || null,
    paymentDate: new Date(paymentDate),
    remarks: remarks || null,
    createdAt: new Date(),
  })

  return {
    studentFeesId,
    paidAmount: updatedPaidAmount,
    remainingAmount: newRemainingAmount,
    status: newStatus,
  }
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
    .where(eq(studentFeesModel.studentId, studentId))

  return fees
}
