import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { openingBalanceModel, NewOpeningBalance } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createOpeningBalance = async (
  openingBalanceData: Omit<
    NewOpeningBalance,
    'openingBalanceId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    // 1️⃣ Check if opening balance already exists for this type
    const existingOpeningBalance = await db
      .select({
        openingBalanceId: openingBalanceModel.openingBalanceId,
      })
      .from(openingBalanceModel)
      .where(eq(openingBalanceModel.type, openingBalanceData.type))
      .limit(1)

    if (existingOpeningBalance.length > 0) {
      throw new Error(
        `Opening balance for '${openingBalanceData.type}' already exists`
      )
    }

    // 2️⃣ Insert new opening balance
    const [newOpeningBalance] = await db.insert(openingBalanceModel).values({
      ...openingBalanceData,
      createdAt: new Date(),
    })

    return newOpeningBalance
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllOpeningBalances = async () => {
  return await db.select().from(openingBalanceModel)
}
