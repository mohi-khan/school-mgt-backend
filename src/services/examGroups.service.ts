import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { examGroupsModel, NewExamGroup } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createExamGroup = async (
  examGroupsData: Omit<NewExamGroup, 'examGroupsId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newExamGroup] = await db.insert(examGroupsModel).values({
      ...examGroupsData,
      createdAt: new Date(),
    })

    return newExamGroup
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllExamGroups = async () => {
  return await db.select().from(examGroupsModel)
}

// Get By Id
export const getExamGroupById = async (examGroupsId: number) => {
  const examGroups = await db
    .select()
    .from(examGroupsModel)
    .where(eq(examGroupsModel.examGroupsId, examGroupsId))
    .limit(1)

  if (!examGroups.length) {
    throw BadRequestError('Cloth examGroups not found')
  }

  return examGroups[0]
}

// Update
export const editExamGroup = async (
  examGroupsId: number,
  examGroupsData: Partial<NewExamGroup>
) => {
  const [updatedExamGroup] = await db
    .update(examGroupsModel)
    .set(examGroupsData)
    .where(eq(examGroupsModel.examGroupsId, examGroupsId))

  if (!updatedExamGroup) {
    throw BadRequestError('Cloth examGroups not found')
  }

  return updatedExamGroup
}

// Delete
export const deleteExamGroup = async (examGroupsId: number) => {
  const result = await db
    .delete(examGroupsModel)
    .where(eq(examGroupsModel.examGroupsId, examGroupsId));
  return { message: "Fees Group deleted successfully" };
};
