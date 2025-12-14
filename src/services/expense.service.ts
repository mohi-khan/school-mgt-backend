import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { expenseHeadModel, expenseModel, NewExpense } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExpense = async (
  expenseData: Omit<NewExpense, 'expenseId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newExpense] = await db.insert(expenseModel).values({
      ...expenseData,
      createdAt: new Date(),
    })

    return newExpense
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExpenses = async () => {
  return await db
    .select({
      // expense table fields
      expenseId: expenseModel.expenseId,
      expenseHeadId: expenseModel.expenseHeadId,
      expenseHead: expenseHeadModel.expenseHead,
      name: expenseModel.name,
      invoiceNumber: expenseModel.invoiceNumber,
      date: expenseModel.date,
      amount: expenseModel.amount,
      description: expenseModel.description,
      createdBy: expenseModel.createdBy,
      createdAt: expenseModel.createdAt,
      updatedBy: expenseModel.updatedBy,
      updatedAt: expenseModel.updatedAt,
    })
    .from(expenseModel)
    .leftJoin(
      expenseHeadModel,
      eq(expenseModel.expenseHeadId, expenseHeadModel.expenseHeadId)
    )
}

// Get By Id
export const getExpenseById = async (expenseId: number) => {
  const expense = await db
    .select()
    .from(expenseModel)
    .where(eq(expenseModel.expenseId, expenseId))
    .limit(1)

  if (!expense.length) {
    throw BadRequestError('Cloth expense not found')
  }

  return expense[0]
}

// Update
export const editExpense = async (
  expenseId: number,
  expenseData: Partial<NewExpense>
) => {
  const [updatedExpense] = await db
    .update(expenseModel)
    .set(expenseData)
    .where(eq(expenseModel.expenseId, expenseId))

  if (!updatedExpense) {
    throw BadRequestError('Cloth expense not found')
  }

  return updatedExpense
}

// Delete
export const deleteExpense = async (expenseId: number) => {
  const result = await db
    .delete(expenseModel)
    .where(eq(expenseModel.expenseId, expenseId));
  return { message: "Fees Group deleted successfully" };
};
