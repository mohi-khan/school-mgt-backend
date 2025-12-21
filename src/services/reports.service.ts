import { db } from '../config/database'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import {
  bankAccountModel,
  classesModel,
  expenseHeadModel,
  expenseModel,
  incomeHeadModel,
  incomeModel,
  mfsModel,
  sectionsModel,
  sessionsModel,
  studentPaymentsModel,
  studentsModel,
} from '../schemas'

export const studentPaymentReport = async (
  fromDate: string,
  toDate: string
) => {
  return await db
    .select({
      studentPaymentId: studentPaymentsModel.studentPaymentId,
      paymentDate: studentPaymentsModel.paymentDate,
      studentName: sql<string>`
        CONCAT(${studentsModel.firstName}, ' ', ${studentsModel.lastName})
      `.as('studentName'),
      studentClass: classesModel.className,
      studentSection: sectionsModel.sectionName,
      studentSession: sessionsModel.sessionName,
      method: studentPaymentsModel.method,
      bankName: bankAccountModel.bankName,
      accountNumber: bankAccountModel.accountNumber,
      branch: bankAccountModel.branch,
      mfsName: mfsModel.accountName,
      mfsNumber: mfsModel.mfsNumber,
      mfsType: mfsModel.mfsType,
      paidAmount: studentPaymentsModel.paidAmount,
    })
    .from(studentPaymentsModel)
    .innerJoin(
      studentsModel,
      eq(studentPaymentsModel.studentId, studentsModel.studentId)
    )
    .innerJoin(
      classesModel,
      eq(studentPaymentsModel.classId, classesModel.classId)
    )
    .innerJoin(
      sectionsModel,
      eq(studentPaymentsModel.sectionId, sectionsModel.sectionId)
    )
    .innerJoin(
      sessionsModel,
      eq(studentPaymentsModel.sessionId, sessionsModel.sessionId)
    )
    .leftJoin(
      bankAccountModel,
      eq(studentPaymentsModel.bankAccountId, bankAccountModel.bankAccountId)
    )
    .leftJoin(
      mfsModel,
      eq(studentPaymentsModel.mfsId, mfsModel.mfsId)
    )
    .where(
      and(
        gte(studentPaymentsModel.paymentDate, new Date(fromDate)),
        lte(studentPaymentsModel.paymentDate, new Date(toDate))
      )
    )
    .orderBy(studentPaymentsModel.paymentDate)
}

export const incomeReport = async (fromDate: string, toDate: string) => {
  const result = await db
    .select({
      incomeId: incomeModel.incomeId,
      name: incomeModel.name,
      incomeHeadId: incomeHeadModel.incomeHeadId,
      incomeHead: incomeHeadModel.incomeHead,
      invoiceNumber: incomeModel.invoiceNumber,
      date: incomeModel.date,
      amount: incomeModel.amount,
    })
    .from(incomeModel)
    .innerJoin(
      incomeHeadModel,
      eq(incomeModel.incomeHeadId, incomeHeadModel.incomeHeadId)
    )
    .where(
      and(
        gte(incomeModel.date, new Date(fromDate)),
        lte(incomeModel.date, new Date(toDate))
      )
    )
    .orderBy(incomeModel.date)

  return result
}

export const expenseReport = async (fromDate: string, toDate: string) => {
  const result = await db
    .select({
      expenseId: expenseModel.expenseId,
      name: expenseModel.name,
      expenseHeadId: expenseHeadModel.expenseHeadId,
      expenseHead: expenseHeadModel.expenseHead,
      invoiceNumber: expenseModel.invoiceNumber,
      date: expenseModel.date,
      amount: expenseModel.amount,
    })
    .from(expenseModel)
    .innerJoin(
      expenseHeadModel,
      eq(expenseModel.expenseHeadId, expenseHeadModel.expenseHeadId)
    )
    .where(
      and(
        gte(expenseModel.date, new Date(fromDate)),
        lte(expenseModel.date, new Date(toDate))
      )
    )
    .orderBy(expenseModel.date)

  return result
}
