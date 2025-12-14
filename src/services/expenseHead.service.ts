import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { expenseHeadModel, NewExpenseHead } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExpenseHead = async (
  expenseHeadData: Omit<NewExpenseHead, 'expenseHeadId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newExpenseHead] = await db.insert(expenseHeadModel).values({
      ...expenseHeadData,
      createdAt: new Date(),
    })

    return newExpenseHead
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExpenseHeads = async () => {
  return await db.select().from(expenseHeadModel)
}

// Get By Id
export const getExpenseHeadById = async (expenseHeadId: number) => {
  const expenseHead = await db
    .select()
    .from(expenseHeadModel)
    .where(eq(expenseHeadModel.expenseHeadId, expenseHeadId))
    .limit(1)

  if (!expenseHead.length) {
    throw BadRequestError('Cloth expenseHead not found')
  }

  return expenseHead[0]
}

// Update
export const editExpenseHead = async (
  expenseHeadId: number,
  expenseHeadData: Partial<NewExpenseHead>
) => {
  const [updatedExpenseHead] = await db
    .update(expenseHeadModel)
    .set(expenseHeadData)
    .where(eq(expenseHeadModel.expenseHeadId, expenseHeadId))

  if (!updatedExpenseHead) {
    throw BadRequestError('Cloth expenseHead not found')
  }

  return updatedExpenseHead
}

// Delete
export const deleteExpenseHead = async (expenseHeadId: number) => {
  const result = await db
    .delete(expenseHeadModel)
    .where(eq(expenseHeadModel.expenseHeadId, expenseHeadId));
  return { message: "Fees Group deleted successfully" };
};
