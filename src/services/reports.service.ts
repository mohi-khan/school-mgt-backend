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

const generateRandomIntId = () => Math.floor(Math.random() * 1_000_000_000)

export const incomeReport = async (fromDate: string, toDate: string) => {
  const incomeData = await db
    .select({
      id: sql<number>`${generateRandomIntId()}`.as('id'),
      source: sql<'income'>`'income'`.as('source'),
      name: incomeModel.name,
      incomeHeadId: incomeHeadModel.incomeHeadId,
      incomeHead: incomeHeadModel.incomeHead,
      invoiceNumber: incomeModel.invoiceNumber,
      date: incomeModel.date,
      amount: incomeModel.amount,
      method: incomeModel.method,
      bankName: bankAccountModel.bankName,
      accountNumber: bankAccountModel.accountNumber,
      branch: bankAccountModel.branch,
      mfsAccountName: mfsModel.accountName,
      mfsNumber: mfsModel.mfsNumber,
    })
    .from(incomeModel)
    .innerJoin(
      incomeHeadModel,
      eq(incomeModel.incomeHeadId, incomeHeadModel.incomeHeadId)
    )
    .leftJoin(
      bankAccountModel,
      eq(incomeModel.bankAccountId, bankAccountModel.bankAccountId)
    )
    .leftJoin(mfsModel, eq(incomeModel.mfsId, mfsModel.mfsId))
    .where(
      and(
        gte(incomeModel.date, new Date(fromDate)),
        lte(incomeModel.date, new Date(toDate))
      )
    )

  const studentPaymentData = await db
    .select({
      id: sql<number>`${generateRandomIntId()}`.as('id'),
      source: sql<'student_payment'>`'student_payment'`.as('source'),
      name: sql<string>`'Student Fee Payment'`.as('name'),
      invoiceNumber: sql<number | null>`NULL`.as('invoiceNumber'),
      date: studentPaymentsModel.paymentDate,
      amount: studentPaymentsModel.paidAmount,
      method: studentPaymentsModel.method,
      bankName: bankAccountModel.bankName,
      accountNumber: bankAccountModel.accountNumber,
      branch: bankAccountModel.branch,
      mfsAccountName: mfsModel.accountName,
      mfsNumber: mfsModel.mfsNumber,
    })
    .from(studentPaymentsModel)
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

  return [...incomeData, ...studentPaymentData].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )
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
      method: expenseModel.method,
      bankName: bankAccountModel.bankName,
      accountNumber: bankAccountModel.accountNumber,
      branch: bankAccountModel.branch,
      mfsAccountName: mfsModel.accountName,
      mfsNumber: mfsModel.mfsNumber,
    })
    .from(expenseModel)
    .leftJoin(
      bankAccountModel,
      eq(expenseModel.bankAccountId, bankAccountModel.bankAccountId)
    )
    .leftJoin(mfsModel, eq(expenseModel.mfsId, mfsModel.mfsId))
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
  /* =======================
     CONTRA (BANK / MFS / CASH)
  ======================= */
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    bmc.date AS date,
    'contra' AS particulars,
    bmc.description AS remarks,
    CASE
      WHEN bmc.to_bank_account_id IS NOT NULL OR bmc.to_mfs_id IS NOT NULL THEN bmc.amount
      ELSE 0
    END AS deposit,
    CASE
      WHEN bmc.from_bank_account_id IS NOT NULL OR bmc.from_mfs_id IS NOT NULL THEN bmc.amount
      ELSE 0
    END AS withdraw,
    CASE
      WHEN bmc.from_bank_account_id IS NULL AND bmc.from_mfs_id IS NULL AND bmc.to_bank_account_id IS NOT NULL THEN 'cash to bank'
      WHEN bmc.from_bank_account_id IS NULL AND bmc.from_mfs_id IS NULL AND bmc.to_mfs_id IS NOT NULL THEN 'cash to mfs'
      WHEN bmc.from_bank_account_id IS NOT NULL AND bmc.to_bank_account_id IS NOT NULL THEN 'bank to bank'
      WHEN bmc.from_mfs_id IS NOT NULL AND bmc.to_mfs_id IS NOT NULL THEN 'mfs to mfs'
      WHEN bmc.from_bank_account_id IS NOT NULL AND bmc.to_mfs_id IS NOT NULL THEN 'bank to mfs'
      WHEN bmc.from_mfs_id IS NOT NULL AND bmc.to_bank_account_id IS NOT NULL THEN 'mfs to bank'
      WHEN bmc.from_bank_account_id IS NOT NULL AND bmc.to_bank_account_id IS NULL AND bmc.to_mfs_id IS NULL THEN 'bank to cash'
      WHEN bmc.from_mfs_id IS NOT NULL AND bmc.to_bank_account_id IS NULL AND bmc.to_mfs_id IS NULL THEN 'mfs to cash'
      ELSE 'cash'
    END AS method,
    ba.bank_name AS bankName,
    ba.account_number AS accountNumber,
    ba.branch AS branch,
    mfs.account_name AS mfsAccountName,
    mfs.mfs_number AS mfsNumber,
    mfs.mfs_type AS mfsType,
    bmc.id AS reference
  FROM bank_mfs_cash bmc
  LEFT JOIN bank_account ba
    ON ba.bank_account_id = COALESCE(bmc.from_bank_account_id, bmc.to_bank_account_id)
  LEFT JOIN mfs
    ON mfs.mfs_id = COALESCE(bmc.from_mfs_id, bmc.to_mfs_id)
  WHERE bmc.date BETWEEN ${fromDate} AND ${toDate}
)

UNION ALL

(
  /* =======================
     EXPENSE
  ======================= */
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    e.date AS date,
    'expense' AS particulars,
    e.name AS remarks,
    0 AS deposit,
    e.amount AS withdraw,
    CASE
      WHEN e.bank_account_id IS NOT NULL THEN 'bank'
      WHEN e.mfs_id IS NOT NULL THEN 'mfs'
      ELSE 'cash'
    END AS method,
    ba.bank_name AS bankName,
    ba.account_number AS accountNumber,
    ba.branch AS branch,
    mfs.account_name AS mfsAccountName,
    mfs.mfs_number AS mfsNumber,
    mfs.mfs_type AS mfsType,
    e.expense_id AS reference
  FROM expense e
  LEFT JOIN bank_account ba
    ON e.bank_account_id = ba.bank_account_id
  LEFT JOIN mfs
    ON e.mfs_id = mfs.mfs_id
  WHERE e.date BETWEEN ${fromDate} AND ${toDate}
)

UNION ALL

(
  /* =======================
     STUDENT PAYMENTS (RECEIPT)
  ======================= */
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    sp.payment_date AS date,
    'receipt' AS particulars,
    sp.remarks AS remarks,
    sp.paid_amount AS deposit,
    0 AS withdraw,
    CASE
      WHEN sp.bank_account_id IS NOT NULL THEN 'bank'
      WHEN sp.mfs_id IS NOT NULL THEN 'mfs'
      ELSE 'cash'
    END AS method,
    ba.bank_name AS bankName,
    ba.account_number AS accountNumber,
    ba.branch AS branch,
    mfs.account_name AS mfsAccountName,
    mfs.mfs_number AS mfsNumber,
    mfs.mfs_type AS mfsType,
    sp.studnet_payment_id AS reference
  FROM student_payments sp
  LEFT JOIN bank_account ba
    ON sp.bank_account_id = ba.bank_account_id
  LEFT JOIN mfs
    ON sp.mfs_id = mfs.mfs_id
  WHERE sp.payment_date BETWEEN ${fromDate} AND ${toDate}
)

UNION ALL

(
  /* =======================
     INCOME (RECEIPT)
  ======================= */
  SELECT
    FLOOR(RAND() * 1000000000) AS id,
    i.date AS date,
    'receipt' AS particulars,
    CONCAT(i.description, ' | Income') AS remarks,
    i.amount AS deposit,
    0 AS withdraw,
    CASE
      WHEN i.bank_account_id IS NOT NULL THEN 'bank'
      WHEN i.mfs_id IS NOT NULL THEN 'mfs'
      ELSE 'cash'
    END AS method,
    ba.bank_name AS bankName,
    ba.account_number AS accountNumber,
    ba.branch AS branch,
    mfs.account_name AS mfsAccountName,
    mfs.mfs_number AS mfsNumber,
    mfs.mfs_type AS mfsType,
    i.income_id AS reference
  FROM income i
  LEFT JOIN bank_account ba
    ON i.bank_account_id = ba.bank_account_id
  LEFT JOIN mfs
    ON i.mfs_id = mfs.mfs_id
  WHERE i.date BETWEEN ${fromDate} AND ${toDate}
)

ORDER BY date ASC
`

  const result = await db.execute(query)
  return result[0]
}
