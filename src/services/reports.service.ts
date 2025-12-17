import { db } from '../config/database'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import {
  classesModel,
  expenseHeadModel,
  expenseModel,
  incomeHeadModel,
  incomeModel,
  sectionsModel,
  studentFeesModel,
  studentPaymentsModel,
  studentsModel,
} from '../schemas'

export const studentPaymentReport = async (fromDate: string, toDate: string) => {
  return await db
    .select({
      studentPaymentId: studentPaymentsModel.studentPaymentId,
      paymentDate: studentPaymentsModel.paymentDate,
      studentName: sql<string>`
        CONCAT(${studentsModel.firstName}, ' ', ${studentsModel.lastName})
      `.as('studentName'),
      studentClass: classesModel.className,
      studentSection: sectionsModel.sectionName,
      paidAmount: studentPaymentsModel.paidAmount,
    })
    .from(studentPaymentsModel)
    .innerJoin(
      studentFeesModel,
      eq(studentPaymentsModel.studentFeesId, studentFeesModel.studentFeesId)
    )
    .innerJoin(
      studentsModel,
      eq(studentFeesModel.studentId, studentsModel.studentId)
    )
    .innerJoin(
      classesModel,
      eq(studentsModel.classId, classesModel.classId)
    )
    .innerJoin(
      sectionsModel,
      eq(studentsModel.sectionId, sectionsModel.sectionId)
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