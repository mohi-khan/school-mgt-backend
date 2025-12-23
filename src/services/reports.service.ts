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
    .leftJoin(mfsModel, eq(studentPaymentsModel.mfsId, mfsModel.mfsId))
    .where(
      and(
        gte(studentPaymentsModel.paymentDate, new Date(fromDate)),
        lte(studentPaymentsModel.paymentDate, new Date(toDate))
      )
    )
    .orderBy(studentPaymentsModel.paymentDate)
}

export const studentBankPaymentReport = async (
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
      bankName: bankAccountModel.bankName,
      accountNumber: bankAccountModel.accountNumber,
      branch: bankAccountModel.branch,
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
    .where(
      and(
        eq(studentPaymentsModel.method, 'bank'),
        gte(studentPaymentsModel.paymentDate, new Date(fromDate)),
        lte(studentPaymentsModel.paymentDate, new Date(toDate))
      )
    )
    .orderBy(studentPaymentsModel.paymentDate)
}

export const studentMfsPaymentReport = async (
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
    .leftJoin(mfsModel, eq(studentPaymentsModel.mfsId, mfsModel.mfsId))
    .where(
      and(
        sql`${studentPaymentsModel.method} IN ('bkash', 'nagad', 'rocket')`,
        gte(studentPaymentsModel.paymentDate, new Date(fromDate)),
        lte(studentPaymentsModel.paymentDate, new Date(toDate))
      )
    )
    .orderBy(studentPaymentsModel.paymentDate)
}

export const studentCashPaymentReport = async (
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
    .leftJoin(mfsModel, eq(studentPaymentsModel.mfsId, mfsModel.mfsId))
    .where(
      and(
        eq(studentPaymentsModel.method, 'cash'),
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

export const getTransactionReport = async (
  fromDate: string,
  toDate: string
) => {
  const query = sql`
(
  -- CONTRA
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    bmc.date AS date,
    'contra' AS particulars,
    bmc.description AS remarks,
    CASE
      WHEN bmc.to_bank_account_id IS NOT NULL OR bmc.to_mfs_id IS NOT NULL
        THEN bmc.amount
      ELSE 0
    END AS deposit,
    CASE
      WHEN bmc.from_bank_account_id IS NOT NULL OR bmc.from_mfs_id IS NOT NULL
        THEN bmc.amount
      ELSE 0
    END AS withdraw,
    bmc.id AS reference
  FROM bank_mfs_cash bmc
  WHERE bmc.date BETWEEN ${fromDate} AND ${toDate}
)

UNION ALL

(
  -- EXPENSE
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    e.date AS date,
    'expense' AS particulars,
    e.name AS remarks,
    0 AS deposit,
    e.amount AS withdraw,
    e.expense_id AS reference
  FROM expense e
  WHERE e.date BETWEEN ${fromDate} AND ${toDate}
)

UNION ALL

(
  -- STUDENT PAYMENTS (RECEIPT)
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    sp.payment_date AS date,
    'receipt' AS particulars,
    sp.remarks AS remarks,
    sp.paid_amount AS deposit,
    0 AS withdraw,
    sp.studnet_payment_id AS reference
  FROM student_payments sp
  WHERE sp.payment_date BETWEEN ${fromDate} AND ${toDate}
)

UNION ALL

(
  -- INCOME (RECEIPT)
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    i.date AS date,
    'receipt' AS particulars,
    CONCAT(i.description, ' | Income') AS remarks,
    i.amount AS deposit,
    0 AS withdraw,
    i.income_id AS reference
  FROM income i
  WHERE i.date BETWEEN ${fromDate} AND ${toDate}
)

ORDER BY date ASC
`

  const result = await db.execute(query)
  return result[0]
}
