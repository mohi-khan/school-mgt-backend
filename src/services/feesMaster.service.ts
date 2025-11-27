import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  feesGroupModel,
  feesMasterModel,
  feesTypeModel,
  NewFeesMaster,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createFeesMaster = async (
  feesMasterData: Omit<
    NewFeesMaster,
    'feesMasterId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const [newFeesMaster] = await db.insert(feesMasterModel).values({
      ...feesMasterData,
      createdAt: new Date(),
    })

    return newFeesMaster
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllFeesMasters = async () => {
  const records = await db
    .select({
      feesMasterId: feesMasterModel.feesMasterId,
      feesGroupId: feesMasterModel.feesGroupId,
      feesGroupName: feesGroupModel.groupName,
      feesTypeId: feesMasterModel.feesTypeId,
      feesTypeName: feesTypeModel.typeName,
      dueDate: feesMasterModel.dueDate,
      amount: feesMasterModel.amount,
      fineType: feesMasterModel.fineType,
      percentageFineAmount: feesMasterModel.percentageFineAmount,
      fixedFineAmount: feesMasterModel.fixedFineAmount,
      perDay: feesMasterModel.perDay,
      createdAt: feesMasterModel.createdAt,
      updatedAt: feesMasterModel.updatedAt,
    })
    .from(feesMasterModel)
    .innerJoin(
      feesGroupModel,
      eq(feesMasterModel.feesGroupId, feesGroupModel.feesGroupId)
    )
    .innerJoin(
      feesTypeModel,
      eq(feesMasterModel.feesTypeId, feesTypeModel.feesTypeId)
    )

  return records
}

// Get By Id
export const getFeesMasterById = async (feesMasterId: number) => {
  const feesMaster = await db
    .select()
    .from(feesMasterModel)
    .where(eq(feesMasterModel.feesMasterId, feesMasterId))
    .limit(1)

  if (!feesMaster.length) {
    throw BadRequestError('Cloth feesMaster not found')
  }

  return feesMaster[0]
}

// Update
export const editFeesMaster = async (
  feesMasterId: number,
  feesMasterData: Partial<NewFeesMaster>
) => {
  const [updatedFeesMaster] = await db
    .update(feesMasterModel)
    .set(feesMasterData)
    .where(eq(feesMasterModel.feesMasterId, feesMasterId))

  if (!updatedFeesMaster) {
    throw BadRequestError('Cloth feesMaster not found')
  }

  return updatedFeesMaster
}

// Delete
export const deleteFeesMaster = async (feesMasterId: number) => {
  const result = await db
    .delete(feesMasterModel)
    .where(eq(feesMasterModel.feesMasterId, feesMasterId))
  return { message: 'Fees Group deleted successfully' }
}
