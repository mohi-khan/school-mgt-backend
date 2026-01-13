import { db } from '../config/database'
import { and, eq, gte, lt, sql } from 'drizzle-orm'
import {
  feesGroupModel,
  feesMasterModel,
  feesTypeModel,
  incomeHeadModel,
  incomeModel,
  studentFeesModel,
  studentPaymentsModel,
  studentsModel,
} from '../schemas'

export const currentMonthPaymentSummary = async () => {
  const now = new Date()

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const result = await db
    .select({
      totalCash: sql<number>`
        SUM(
          CASE 
            WHEN ${studentPaymentsModel.method} = 'cash'
            THEN ${studentPaymentsModel.paidAmount}
            ELSE 0
          END
        )
      `,
      totalBank: sql<number>`
        SUM(
          CASE 
            WHEN ${studentPaymentsModel.method} = 'bank'
            THEN ${studentPaymentsModel.paidAmount}
            ELSE 0
          END
        )
      `,
      totalMfs: sql<number>`
        SUM(
          CASE 
            WHEN ${studentPaymentsModel.method} IN ('bkash', 'nagad', 'rocket')
            THEN ${studentPaymentsModel.paidAmount}
            ELSE 0
          END
        )
      `,
    })
    .from(studentPaymentsModel)
    .where(
      and(
        gte(studentPaymentsModel.paymentDate, startOfMonth),
        lt(studentPaymentsModel.paymentDate, startOfNextMonth)
      )
    )

  return result
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const getCurrentYearMonthlyIncome = async () => {
  const currentYear = new Date().getFullYear()

  /* ------------------ Income Table ------------------ */
  const incomeData = await db
    .select({
      month: sql<number>`MONTH(${incomeModel.date})`.as('month'),
      amount: sql<number>`SUM(${incomeModel.amount})`.as('amount'),
      reference: incomeHeadModel.incomeHead,
    })
    .from(incomeModel)
    .innerJoin(
      incomeHeadModel,
      eq(incomeModel.incomeHeadId, incomeHeadModel.incomeHeadId)
    )
    .where(sql`YEAR(${incomeModel.date}) = ${currentYear}`)
    .groupBy(sql`MONTH(${incomeModel.date})`, incomeHeadModel.incomeHead)

  /* ---------------- Student Payments ---------------- */
  const studentPaymentData = await db
    .select({
      month: sql<number>`MONTH(${studentPaymentsModel.paymentDate})`.as(
        'month'
      ),
      amount: sql<number>`SUM(${studentPaymentsModel.paidAmount})`.as('amount'),
      reference: sql<string>`
      CONCAT(
        'Payment of admission no:',
        ${studentsModel.admissionNo},
        ' of ',
        ${feesGroupModel.groupName},
        ' - ',
        ${feesTypeModel.typeName}
      )
    `.as('reference'),
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
      feesMasterModel,
      eq(studentFeesModel.feesMasterId, feesMasterModel.feesMasterId)
    )
    .innerJoin(
      feesGroupModel,
      eq(feesMasterModel.feesGroupId, feesGroupModel.feesGroupId)
    )
    .innerJoin(
      feesTypeModel,
      eq(feesMasterModel.feesTypeId, feesTypeModel.feesTypeId)
    )
    .where(sql`YEAR(${studentPaymentsModel.paymentDate}) = ${currentYear}`)
    .groupBy(
      sql`MONTH(${studentPaymentsModel.paymentDate})`,
      studentsModel.admissionNo,
      feesGroupModel.groupName,
      feesTypeModel.typeName
    )

  /* ---------------- Merge + Format ---------------- */
  const result = [...incomeData, ...studentPaymentData].map((item) => ({
    id: Math.floor(Math.random() * 1_000_000_000),
    month: MONTHS[item.month - 1],
    amount: Number(item.amount),
    reference: item.reference,
  }))

  return result
}

