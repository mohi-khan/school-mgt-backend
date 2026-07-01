import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { divisionModel, NewDivision } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createDivision = async (
  divisionData: Omit<NewDivision, 'divisionId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newDivision] = await db.insert(divisionModel).values({
      ...divisionData,
      createdAt: new Date(),
    })

    return newDivision
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllDivisions = async (tenantId: number) => {
  return await db
    .select()
    .from(divisionModel)
    .where(eq(divisionModel.tenantId, tenantId))
}

// Get By Id
export const getDivisionById = async (divisionId: number) => {
  const division = await db
    .select()
    .from(divisionModel)
    .where(eq(divisionModel.divisionId, divisionId))
    .limit(1)

  if (!division.length) {
    throw BadRequestError('Cloth division not found')
  }

  return division[0]
}

// Update
export const editDivision = async (
  divisionId: number,
  divisionData: Partial<NewDivision>
) => {
  const [updatedDivision] = await db
    .update(divisionModel)
    .set(divisionData)
    .where(eq(divisionModel.divisionId, divisionId))

  if (!updatedDivision) {
    throw BadRequestError('Cloth division not found')
  }

  return updatedDivision
}

// Delete
export const deleteDivision = async (divisionId: number) => {
  const result = await db
    .delete(divisionModel)
    .where(eq(divisionModel.divisionId, divisionId))
  return { message: 'Fees Group deleted successfully' }
}
