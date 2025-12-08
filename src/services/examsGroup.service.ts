import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { examsGroupModel, NewExamGroup } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExamGroup = async (
  examsGroupData: Omit<NewExamGroup, 'examsGroupId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newExamGroup] = await db.insert(examsGroupModel).values({
      ...examsGroupData,
      createdAt: new Date(),
    })

    return newExamGroup
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExamGroups = async () => {
  return await db.select().from(examsGroupModel)
}

// Get By Id
export const getExamGroupById = async (examsGroupId: number) => {
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
export const editExamGroup = async (
  examsGroupId: number,
  examsGroupData: Partial<NewExamGroup>
) => {
  const [updatedExamGroup] = await db
    .update(examsGroupModel)
    .set(examsGroupData)
    .where(eq(examsGroupModel.examsGroupId, examsGroupId))

  if (!updatedExamGroup) {
    throw BadRequestError('Cloth examsGroup not found')
  }

  return updatedExamGroup
}

// Delete
export const deleteExamGroup = async (examsGroupId: number) => {
  const result = await db
    .delete(examsGroupModel)
    .where(eq(examsGroupModel.examsGroupId, examsGroupId));
  return { message: "Fees Group deleted successfully" };
};
