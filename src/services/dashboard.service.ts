import { db } from '../config/database'
import { and, eq, gte, lt, sql } from 'drizzle-orm'
import {
  expenseHeadModel,
  expenseModel,
  feesGroupModel,
  feesMasterModel,
  feesTypeModel,
  incomeHeadModel,
  incomeModel,
  studentFeesModel,
  studentPaymentsModel,
  studentsModel,
} from '../schemas'

export const currentMonthSchoolSummary = async () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  /** -------------------------------
   * STUDENT PAYMENTS (INFLOW)
   -------------------------------- */
  const [studentPayments] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${studentPaymentsModel.method} = 'cash' THEN ${studentPaymentsModel.paidAmount} ELSE 0 END)`,
      bank: sql<number>`SUM(CASE WHEN ${studentPaymentsModel.method} = 'bank' THEN ${studentPaymentsModel.paidAmount} ELSE 0 END)`,
      mfs: sql<number>`SUM(CASE WHEN ${studentPaymentsModel.method} IN ('bkash','nagad','rocket') THEN ${studentPaymentsModel.paidAmount} ELSE 0 END)`,
      total: sql<number>`SUM(${studentPaymentsModel.paidAmount})`,
    })
    .from(studentPaymentsModel)
    .where(
      and(
        gte(studentPaymentsModel.paymentDate, startOfMonth),
        lt(studentPaymentsModel.paymentDate, startOfNextMonth)
      )
    )

  /** -------------------------------
   * INCOME (INFLOW)
   -------------------------------- */
  const [income] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${incomeModel.method} = 'cash' THEN ${incomeModel.amount} ELSE 0 END)`,
      bank: sql<number>`SUM(CASE WHEN ${incomeModel.method} = 'bank' THEN ${incomeModel.amount} ELSE 0 END)`,
      mfs: sql<number>`SUM(CASE WHEN ${incomeModel.method} IN ('bkash','nagad','rocket') THEN ${incomeModel.amount} ELSE 0 END)`,
      total: sql<number>`SUM(${incomeModel.amount})`,
    })
    .from(incomeModel)
    .where(
      and(
        gte(incomeModel.date, startOfMonth),
        lt(incomeModel.date, startOfNextMonth)
      )
    )

  /** -------------------------------
   * EXPENSE (OUTFLOW)
   -------------------------------- */
  const [expense] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${expenseModel.method} = 'cash' THEN ${expenseModel.amount} ELSE 0 END)`,
      bank: sql<number>`SUM(CASE WHEN ${expenseModel.method} = 'bank' THEN ${expenseModel.amount} ELSE 0 END)`,
      mfs: sql<number>`SUM(CASE WHEN ${expenseModel.method} IN ('bkash','nagad','rocket') THEN ${expenseModel.amount} ELSE 0 END)`,
      total: sql<number>`SUM(${expenseModel.amount})`,
    })
    .from(expenseModel)
    .where(
      and(
        gte(expenseModel.date, startOfMonth),
        lt(expenseModel.date, startOfNextMonth)
      )
    )

  /** -------------------------------
   * FINAL BALANCE CALCULATION
   -------------------------------- */
  const cashBalance =
    (studentPayments.cash ?? 0) + (income.cash ?? 0) - (expense.cash ?? 0)

  const bankBalance =
    (studentPayments.bank ?? 0) + (income.bank ?? 0) - (expense.bank ?? 0)

  const mfsBalance =
    (studentPayments.mfs ?? 0) + (income.mfs ?? 0) - (expense.mfs ?? 0)

  const totalBalance =
    (studentPayments.total ?? 0) + (income.total ?? 0) - (expense.total ?? 0)

  return {
    totalBalance,
    cashBalance,
    bankBalance,
    mfsBalance,
  }
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

  /* -------- Income from income table -------- */
  const incomeData = await db
    .select({
      month: sql<number>`MONTH(${incomeModel.date})`.as('month'),
      amount: sql<number>`SUM(${incomeModel.amount})`.as('amount'),
    })
    .from(incomeModel)
    .where(sql`YEAR(${incomeModel.date}) = ${currentYear}`)
    .groupBy(sql`MONTH(${incomeModel.date})`)

  /* -------- Income from student payments -------- */
  const studentPaymentData = await db
    .select({
      month: sql<number>`MONTH(${studentPaymentsModel.paymentDate})`.as(
        'month'
      ),
      amount: sql<number>`SUM(${studentPaymentsModel.paidAmount})`.as('amount'),
    })
    .from(studentPaymentsModel)
    .where(sql`YEAR(${studentPaymentsModel.paymentDate}) = ${currentYear}`)
    .groupBy(sql`MONTH(${studentPaymentsModel.paymentDate})`)

  /* -------- Merge & sum per month -------- */
  const monthMap: Record<number, number> = {}

  for (const row of [...incomeData, ...studentPaymentData]) {
    monthMap[row.month] = (monthMap[row.month] || 0) + Number(row.amount)
  }

  return Object.entries(monthMap).map(([month, amount]) => ({
    id: Number(month),
    month: MONTHS[Number(month) - 1],
    amount,
  }))
}

export const getCurrentYearMonthlyExpense = async () => {
  const currentYear = new Date().getFullYear()

  const expenseData = await db
    .select({
      month: sql<number>`MONTH(${expenseModel.date})`.as('month'),
      amount: sql<number>`SUM(${expenseModel.amount})`.as('amount'),
    })
    .from(expenseModel)
    .where(sql`YEAR(${expenseModel.date}) = ${currentYear}`)
    .groupBy(sql`MONTH(${expenseModel.date})`)

  return expenseData.map((item) => ({
    id: item.month,
    month: MONTHS[item.month - 1],
    amount: Number(item.amount),
  }))
}
