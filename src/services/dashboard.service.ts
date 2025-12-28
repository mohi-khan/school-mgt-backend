import { db } from '../config/database'
import { and, gte, lt, sql } from 'drizzle-orm'
import { studentPaymentsModel } from '../schemas'

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