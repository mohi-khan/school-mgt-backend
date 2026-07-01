import { db } from '../config/database'
import { and, eq, sql } from 'drizzle-orm'
import {
  bankAccountModel,
  bankMFsCashModel,
  expenseHeadModel,
  expenseModel,
  incomeHeadModel,
  incomeModel,
  mfsModel,
  openingBalanceModel,
  studentPaymentsModel,
} from '../schemas'

export const getOverallSchoolSummary = async (tenantId: number) => {
  /** -------------------------------
   * OPENING BALANCE
   -------------------------------- */
  const openingBalances = await db
    .select({
      type: openingBalanceModel.type,
      amount: openingBalanceModel.amount,
    })
    .from(openingBalanceModel)
    .where(eq(openingBalanceModel.tenantId, tenantId))

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
    })
    .from(studentPaymentsModel)

  const [income] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${incomeModel.method} = 'cash' THEN ${incomeModel.amount} ELSE 0 END)`,
    })
    .from(incomeModel)

  /** -------------------------------
   * EXPENSE
   -------------------------------- */
  const [expense] = await db
    .select({
      cash: sql<number>`SUM(CASE WHEN ${expenseModel.method} = 'cash' THEN ${expenseModel.amount} ELSE 0 END)`,
    })
    .from(expenseModel)

  /** -------------------------------
   * TRANSFERS (bank_mfs_cash)
   * cashOut = Cash → Bank (deposits)
   * cashIn = Bank → Cash (withdrawals)
   -------------------------------- */
  const [transfers] = await db
    .select({
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
      cashIn: sql<number>`
        SUM(
          CASE
            WHEN ${bankMFsCashModel.toBankAccountId} IS NULL
             AND ${bankMFsCashModel.toMfsId} IS NULL
            THEN ${bankMFsCashModel.amount}
            ELSE 0
          END
        )
      `,
    })
    .from(bankMFsCashModel)

  /** -------------------------------
   * BANK & MFS ACCOUNT BALANCES
   -------------------------------- */
  const [bankAccountsBalance] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${bankAccountModel.balance}), 0)`,
    })
    .from(bankAccountModel)

  const [mfsAccountsBalance] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${mfsModel.balance}), 0)`,
    })
    .from(mfsModel)

  /** -------------------------------
   * FINAL BALANCES
   -------------------------------- */
  const cashBalance =
    opening.cash +
    (studentPayments.cash ?? 0) +
    (income.cash ?? 0) +
    (transfers.cashIn ?? 0) -
    (expense.cash ?? 0) -
    (transfers.cashOut ?? 0)

  const bankBalance = opening.bank + (bankAccountsBalance.total ?? 0)

  const mfsBalance = opening.mfs + (mfsAccountsBalance.total ?? 0)

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

export const getCurrentYearMonthlyIncome = async (tenantId: number) => {
  const currentYear = new Date().getFullYear()

  const incomeData = await db
    .select({
      month: sql<number>`MONTH(${incomeModel.date})`.as('month'),
      incomeHead: incomeHeadModel.incomeHead,
      amount: sql<number>`SUM(${incomeModel.amount})`.as('amount'),
    })
    .from(incomeModel)
    .leftJoin(
      incomeHeadModel,
      sql`${incomeModel.incomeHeadId} = ${incomeHeadModel.incomeHeadId}`
    )
    .where(
      and(
        sql`YEAR(${incomeModel.date}) = ${currentYear}`,
        eq(incomeModel.tenantId, tenantId)
      )
    )
    .groupBy(sql`MONTH(${incomeModel.date}), ${incomeModel.incomeHeadId}`)

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

  const monthMap: Record<
    number,
    {
      totalAmount: number
      incomeHeads: { incomeHead: string; amount: number }[]
    }
  > = {}

  // income heads
  for (const row of incomeData) {
    const month = row.month

    if (!monthMap[month]) {
      monthMap[month] = {
        totalAmount: 0,
        incomeHeads: [],
      }
    }

    const amount = Number(row.amount || 0)

    monthMap[month].totalAmount += amount

    monthMap[month].incomeHeads.push({
      incomeHead: row.incomeHead || 'Unknown',
      amount,
    })
  }

  // student payments
  for (const row of studentPaymentData) {
    const month = row.month

    if (!monthMap[month]) {
      monthMap[month] = {
        totalAmount: 0,
        incomeHeads: [],
      }
    }

    const amount = Number(row.amount || 0)

    monthMap[month].totalAmount += amount

    monthMap[month].incomeHeads.push({
      incomeHead: 'Student Payment',
      amount,
    })
  }

  // FINAL SERIALIZATION STEP
  return Object.entries(monthMap).map(([month, data], index) => ({
    id: index + 1,
    month: MONTHS[Number(month) - 1],
    totalAmount: data.totalAmount,

    incomeHeads: data.incomeHeads.map((h, i) => ({
      id: i + 1, // serial per month
      incomeHead: h.incomeHead,
      amount: h.amount,
    })),
  }))
}

export const getCurrentYearMonthlyExpense = async (tenantId: number) => {
  const currentYear = new Date().getFullYear()

  const expenseData = await db
    .select({
      month: sql<number>`MONTH(${expenseModel.date})`.as('month'),
      expenseHead: expenseHeadModel.expenseHead,
      amount: sql<number>`SUM(${expenseModel.amount})`.as('amount'),
    })
    .from(expenseModel)
    .leftJoin(
      expenseHeadModel,
      sql`${expenseModel.expenseHeadId} = ${expenseHeadModel.expenseHeadId}`
    )
    .where(
      and(
        sql`YEAR(${expenseModel.date}) = ${currentYear}`,
        eq(expenseModel.tenantId, tenantId)
      )
    )
    .groupBy(sql`MONTH(${expenseModel.date}), ${expenseModel.expenseHeadId}`)

  const monthMap: Record<
    number,
    {
      totalAmount: number
      expenseHeads: { expenseHead: string; amount: number }[]
    }
  > = {}

  for (const row of expenseData) {
    const month = row.month

    if (!monthMap[month]) {
      monthMap[month] = {
        totalAmount: 0,
        expenseHeads: [],
      }
    }

    const amount = Number(row.amount || 0)

    monthMap[month].totalAmount += amount

    monthMap[month].expenseHeads.push({
      expenseHead: row.expenseHead || 'Unknown',
      amount,
    })
  }

  return Object.entries(monthMap).map(([month, data], index) => ({
    id: index + 1,
    month: MONTHS[Number(month) - 1],
    totalAmount: data.totalAmount,

    expenseHeads: data.expenseHeads.map((h, i) => ({
      id: i + 1,
      expenseHead: h.expenseHead,
      amount: h.amount,
    })),
  }))
}
