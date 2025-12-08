import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { examsGroupModel, NewExamsGroup } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExamsGroup = async (
  examsGroupData: Omit<NewExamsGroup, 'examsGroupId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newExamsGroup] = await db.insert(examsGroupModel).values({
      ...examsGroupData,
      createdAt: new Date(),
    })

    return newExamsGroup
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExamsGroups = async () => {
  return await db.select().from(examsGroupModel)
}

// Get By Id
export const getExamsGroupById = async (examsGroupId: number) => {
  const examsGroup = await db
    .select()
    .from(examsGroupModel)
    .where(eq(examsGroupModel.examsGroupId, examsGroupId))
    .limit(1)

  if (!examsGroup.length) {
    throw BadRequestError('Cloth examsGroup not found')
  }

  return examsGroup[0]
}

// Update
export const editExamsGroup = async (
  examsGroupId: number,
  examsGroupData: Partial<NewExamsGroup>
) => {
  const [updatedExamsGroup] = await db
    .update(examsGroupModel)
    .set(examsGroupData)
    .where(eq(examsGroupModel.examsGroupId, examsGroupId))

  if (!updatedExamsGroup) {
    throw BadRequestError('Cloth examsGroup not found')
  }

  return updatedExamsGroup
}

// Delete
export const deleteExamsGroup = async (examsGroupId: number) => {
  const result = await db
    .delete(examsGroupModel)
    .where(eq(examsGroupModel.examsGroupId, examsGroupId));
  return { message: "Fees Group deleted successfully" };
};
