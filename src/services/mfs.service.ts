import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { mfsModel, NewMfs } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createMfs = async (
  mfsData: Omit<NewMfs, 'mfsId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newMfs] = await db.insert(mfsModel).values({
      ...mfsData,
      createdAt: new Date(),
    })

    return newMfs
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllMfss = async () => {
  return await db.select().from(mfsModel)
}

// Get By Id
export const getMfsById = async (mfsId: number) => {
  const mfs = await db
    .select()
    .from(mfsModel)
    .where(eq(mfsModel.mfsId, mfsId))
    .limit(1)

  if (!mfs.length) {
    throw BadRequestError('Cloth mfs not found')
  }

  return mfs[0]
}

// Update
export const editMfs = async (
  mfsId: number,
  mfsData: Partial<NewMfs>
) => {
  const [updatedMfs] = await db
    .update(mfsModel)
    .set(mfsData)
    .where(eq(mfsModel.mfsId, mfsId))

  if (!updatedMfs) {
    throw BadRequestError('Cloth mfs not found')
  }

  return updatedMfs
}

// Delete
export const deleteMfs = async (mfsId: number) => {
  const result = await db
    .delete(mfsModel)
    .where(eq(mfsModel.mfsId, mfsId));
  return { message: "Fees Group deleted successfully" };
};
