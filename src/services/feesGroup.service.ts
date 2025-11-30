import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { feesGroupModel, NewFeesGroup } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createFeesGroup = async (
  feesGroupData: Omit<NewFeesGroup, 'feesGroupId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newFeesGroup] = await db.insert(feesGroupModel).values({
      ...feesGroupData,
      createdAt: new Date(),
    })

    return newFeesGroup
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllFeesGroups = async () => {
  return await db.select().from(feesGroupModel)
}

// Get By Id
export const getFeesGroupById = async (feesGroupId: number) => {
  const feesGroup = await db
    .select()
    .from(feesGroupModel)
    .where(eq(feesGroupModel.feesGroupId, feesGroupId))
    .limit(1)

  if (!feesGroup.length) {
    throw BadRequestError('Cloth feesGroup not found')
  }

  return feesGroup[0]
}

// Update
export const editFeesGroup = async (
  feesGroupId: number,
  feesGroupData: Partial<NewFeesGroup>
) => {
  const [updatedFeesGroup] = await db
    .update(feesGroupModel)
    .set(feesGroupData)
    .where(eq(feesGroupModel.feesGroupId, feesGroupId))

  if (!updatedFeesGroup) {
    throw BadRequestError('Cloth feesGroup not found')
  }

  return updatedFeesGroup
}

// Delete
export const deleteFeesGroup = async (feesGroupId: number) => {
  const result = await db
    .delete(feesGroupModel)
    .where(eq(feesGroupModel.feesGroupId, feesGroupId));
  return { message: "Fees Group deleted successfully" };
};
