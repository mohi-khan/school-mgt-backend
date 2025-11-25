import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { feesTypeModel, NewFeesType } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createFeesType = async (
  feesTypeData: Omit<NewFeesType, 'feesTypeId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newFeesType] = await db.insert(feesTypeModel).values({
      ...feesTypeData,
      createdAt: new Date(),
    })

    return newFeesType
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllFeesTypes = async () => {
  return await db.select().from(feesTypeModel)
}

// Get By Id
export const getFeesTypeById = async (feesTypeId: number) => {
  const feesType = await db
    .select()
    .from(feesTypeModel)
    .where(eq(feesTypeModel.feesTypeId, feesTypeId))
    .limit(1)

  if (!feesType.length) {
    throw BadRequestError('Cloth feesType not found')
  }

  return feesType[0]
}

// Update
export const editFeesType = async (
  feesTypeId: number,
  feesTypeData: Partial<NewFeesType>
) => {
  const [updatedFeesType] = await db
    .update(feesTypeModel)
    .set(feesTypeData)
    .where(eq(feesTypeModel.feesTypeId, feesTypeId))

  if (!updatedFeesType) {
    throw BadRequestError('Cloth feesType not found')
  }

  return updatedFeesType
}

// Delete
export const deleteFeesType = async (feesTypeId: number) => {
  const result = await db
    .delete(feesTypeModel)
    .where(eq(feesTypeModel.feesTypeId, feesTypeId));
  return { message: "Fees Type deleted successfully" };
};