import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { incomeHeadModel, incomeModel, NewIncome } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createIncome = async (
  incomeData: Omit<NewIncome, 'incomeId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newIncome] = await db.insert(incomeModel).values({
      ...incomeData,
      createdAt: new Date(),
    })

    return newIncome
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllIncomes = async () => {
  return await db
    .select({
      // income table fields
      incomeId: incomeModel.incomeId,
      incomeHeadId: incomeModel.incomeHeadId,
      incomeHead: incomeHeadModel.incomeHead,
      name: incomeModel.name,
      invoiceNumber: incomeModel.invoiceNumber,
      date: incomeModel.date,
      method: incomeModel.method,
      amount: incomeModel.amount,
      description: incomeModel.description,
      createdBy: incomeModel.createdBy,
      createdAt: incomeModel.createdAt,
      updatedBy: incomeModel.updatedBy,
      updatedAt: incomeModel.updatedAt,
    })
    .from(incomeModel)
    .leftJoin(
      incomeHeadModel,
      eq(incomeModel.incomeHeadId, incomeHeadModel.incomeHeadId)
    )
}

// Get By Id
export const getIncomeById = async (incomeId: number) => {
  const income = await db
    .select()
    .from(incomeModel)
    .where(eq(incomeModel.incomeId, incomeId))
    .limit(1)

  if (!income.length) {
    throw BadRequestError('Cloth income not found')
  }

  return income[0]
}

// Update
export const editIncome = async (
  incomeId: number,
  incomeData: Partial<NewIncome>
) => {
  const [updatedIncome] = await db
    .update(incomeModel)
    .set(incomeData)
    .where(eq(incomeModel.incomeId, incomeId))

  if (!updatedIncome) {
    throw BadRequestError('Cloth income not found')
  }

  return updatedIncome
}

// Delete
export const deleteIncome = async (incomeId: number) => {
  const result = await db
    .delete(incomeModel)
    .where(eq(incomeModel.incomeId, incomeId));
  return { message: "Fees Group deleted successfully" };
};
