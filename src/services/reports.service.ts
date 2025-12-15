import { db } from '../config/database'
import { and, eq, gte, lte, sql } from 'drizzle-orm'
import {
  studentFeesModel,
  studentPaymentsModel,
  studentsModel,
} from '../schemas'

export const studentPaymentReport = async (fromDate: string, toDate: string) => {
  return await db
    .select({
      paymentDate: studentPaymentsModel.paymentDate,
      studentName: sql<string>`
        CONCAT(${studentsModel.firstName}, ' ', ${studentsModel.lastName})
      `.as('studentName'),
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
    .where(
      and(
        gte(studentPaymentsModel.paymentDate, new Date(fromDate)),
        lte(studentPaymentsModel.paymentDate, new Date(toDate))
      )
    )
    .orderBy(studentPaymentsModel.paymentDate)
}
