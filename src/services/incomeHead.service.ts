import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { incomeHeadModel, NewIncomeHead } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createIncomeHead = async (
  incomeHeadData: Omit<NewIncomeHead, 'incomeHeadId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newIncomeHead] = await db.insert(incomeHeadModel).values({
      ...incomeHeadData,
      createdAt: new Date(),
    })

    return newIncomeHead
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllIncomeHeads = async () => {
  return await db.select().from(incomeHeadModel)
}

// Get By Id
export const getIncomeHeadById = async (incomeHeadId: number) => {
  const incomeHead = await db
    .select()
    .from(incomeHeadModel)
    .where(eq(incomeHeadModel.incomeHeadId, incomeHeadId))
    .limit(1)

  if (!incomeHead.length) {
    throw BadRequestError('Cloth incomeHead not found')
  }

  return incomeHead[0]
}

// Update
export const editIncomeHead = async (
  incomeHeadId: number,
  incomeHeadData: Partial<NewIncomeHead>
) => {
  const [updatedIncomeHead] = await db
    .update(incomeHeadModel)
    .set(incomeHeadData)
    .where(eq(incomeHeadModel.incomeHeadId, incomeHeadId))

  if (!updatedIncomeHead) {
    throw BadRequestError('Cloth incomeHead not found')
  }

  return updatedIncomeHead
}

// Delete
export const deleteIncomeHead = async (incomeHeadId: number) => {
  const result = await db
    .delete(incomeHeadModel)
    .where(eq(incomeHeadModel.incomeHeadId, incomeHeadId));
  return { message: "Fees Group deleted successfully" };
};
