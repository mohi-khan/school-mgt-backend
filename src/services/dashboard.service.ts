import { db } from '../config/database'
import { sql } from 'drizzle-orm'
import {
  bankMFsCashModel,
  expenseModel,
  incomeModel,
  openingBalanceModel,
  studentPaymentsModel,
} from '../schemas'

export const getOverallSchoolSummary = async () => {
  /** -------------------------------
   * OPENING BALANCE
   -------------------------------- */
  const openingBalances = await db
    .select({
      type: openingBalanceModel.type,
      amount: openingBalanceModel.amount,
    })
    .from(openingBalanceModel)

  const opening = { cash: 0, bank: 0, mfs: 0 }

  for (const ob of openingBalances) {
    opening[ob.type] = Number(ob.amount)
  }

  /** -------------------------------
   * INFLOW
   -------------------------------- */
  const [studentPayments] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${studentPaymentsModel.method} = 'cash' THEN ${studentPaymentsModel.paidAmount} ELSE 0 END)`,
      bank: sql<number>`SUM(CASE WHEN ${studentPaymentsModel.method} = 'bank' THEN ${studentPaymentsModel.paidAmount} ELSE 0 END)`,
      mfs: sql<number>`SUM(CASE WHEN ${studentPaymentsModel.method} IN ('bkash','nagad','rocket') THEN ${studentPaymentsModel.paidAmount} ELSE 0 END)`,
    })
    .from(studentPaymentsModel)

  const [income] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${incomeModel.method} = 'cash' THEN ${incomeModel.amount} ELSE 0 END)`,
      bank: sql<number>`SUM(CASE WHEN ${incomeModel.method} = 'bank' THEN ${incomeModel.amount} ELSE 0 END)`,
      mfs: sql<number>`SUM(CASE WHEN ${incomeModel.method} IN ('bkash','nagad','rocket') THEN ${incomeModel.amount} ELSE 0 END)`,
    })
    .from(incomeModel)

  /** -------------------------------
   * EXPENSE
   -------------------------------- */
  const [expense] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${expenseModel.method} = 'cash' THEN ${expenseModel.amount} ELSE 0 END)`,
      bank: sql<number>`SUM(CASE WHEN ${expenseModel.method} = 'bank' THEN ${expenseModel.amount} ELSE 0 END)`,
      mfs: sql<number>`SUM(CASE WHEN ${expenseModel.method} IN ('bkash','nagad','rocket') THEN ${expenseModel.amount} ELSE 0 END)`,
    })
    .from(expenseModel)

  /** -------------------------------
   * TRANSFERS (bank_mfs_cash)
   -------------------------------- */
  const [transfers] = await db
    .select({
      cashIn: sql<number>`
        SUM(
          CASE
            WHEN ${bankMFsCashModel.toBankAccountId} IS NULL
             AND ${bankMFsCashModel.toMfsId} IS NULL
            THEN 0
            WHEN ${bankMFsCashModel.toBankAccountId} IS NULL
             AND ${bankMFsCashModel.toMfsId} IS NOT NULL
            THEN 0
            ELSE 0
          END
        )
      `,
      cashOut: sql<number>`
        SUM(
          CASE
            WHEN ${bankMFsCashModel.fromBankAccountId} IS NULL
             AND ${bankMFsCashModel.fromMfsId} IS NULL
            THEN ${bankMFsCashModel.amount}
            ELSE 0
          END
        )
      `,
      bankIn: sql<number>`
        SUM(
          CASE
            WHEN ${bankMFsCashModel.toBankAccountId} IS NOT NULL
            THEN ${bankMFsCashModel.amount}
            ELSE 0
          END
        )
      `,
      bankOut: sql<number>`
        SUM(
          CASE
            WHEN ${bankMFsCashModel.fromBankAccountId} IS NOT NULL
            THEN ${bankMFsCashModel.amount}
            ELSE 0
          END
        )
      `,
      mfsIn: sql<number>`
        SUM(
          CASE
            WHEN ${bankMFsCashModel.toMfsId} IS NOT NULL
            THEN ${bankMFsCashModel.amount}
            ELSE 0
          END
        )
      `,
      mfsOut: sql<number>`
        SUM(
          CASE
            WHEN ${bankMFsCashModel.fromMfsId} IS NOT NULL
            THEN ${bankMFsCashModel.amount}
            ELSE 0
          END
        )
      `,
    })
    .from(bankMFsCashModel)

  /** -------------------------------
   * FINAL BALANCES
   -------------------------------- */
  const cashBalance =
    opening.cash +
    (studentPayments.cash ?? 0) +
    (income.cash ?? 0) -
    (expense.cash ?? 0) -
    (transfers.cashOut ?? 0)

  const bankBalance =
    opening.bank +
    (studentPayments.bank ?? 0) +
    (income.bank ?? 0) -
    (expense.bank ?? 0) +
    (transfers.bankIn ?? 0) -
    (transfers.bankOut ?? 0)

  const mfsBalance =
    opening.mfs +
    (studentPayments.mfs ?? 0) +
    (income.mfs ?? 0) -
    (expense.mfs ?? 0) +
    (transfers.mfsIn ?? 0) -
    (transfers.mfsOut ?? 0)

  const totalBalance = cashBalance + bankBalance + mfsBalance

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
