import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  bankAccountModel,
  bankMFsCashModel,
  mfsModel,
  NewBankMfsCash,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'
import { alias } from 'drizzle-orm/mysql-core'

// Create
export const createBankMfsCash = async (
  bankToBankConversionData: Omit<
    NewBankMfsCash,
    'id' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const [newBankMfsCash] = await db.insert(bankMFsCashModel).values({
      ...bankToBankConversionData,
      createdAt: new Date(),
    })

    return newBankMfsCash
  } catch (error) {
    throw error
  }
}

// Get All
const fromBank = alias(bankAccountModel, 'from_bank')
const toBank = alias(bankAccountModel, 'to_bank')

const fromMfs = alias(mfsModel, 'from_mfs')
const toMfs = alias(mfsModel, 'to_mfs')

export const getAllBankMfsCash = async () => {
  return await db
    .select({
      // ===== Bank ↔ MFS Cash table =====
      id: bankMFsCashModel.id,
      fromBankAccountId: bankMFsCashModel.fromBankAccountId,
      fromMfsId: bankMFsCashModel.fromMfsId,
      toBankAccountId: bankMFsCashModel.toBankAccountId,
      toMfsId: bankMFsCashModel.toMfsId,
      amount: bankMFsCashModel.amount,
      date: bankMFsCashModel.date,
      description: bankMFsCashModel.description,
      createdBy: bankMFsCashModel.createdBy,
      createdAt: bankMFsCashModel.createdAt,
      updatedBy: bankMFsCashModel.updatedBy,
      updatedAt: bankMFsCashModel.updatedAt,

      // ===== From Bank =====
      fromBankName: fromBank.bankName,
      fromBankAccountNumber: fromBank.accountNumber,
      fromBankBranch: fromBank.branch,
      fromBankAccountName: fromBank.accountName,

      // ===== To Bank =====
      toBankName: toBank.bankName,
      toBankAccountNumber: toBank.accountNumber,
      toBankBranch: toBank.branch,
      toBankAccountName: toBank.accountName,

      // ===== From MFS =====
      fromMfsAccountName: fromMfs.accountName,
      fromMfsNumber: fromMfs.mfsNumber,
      fromMfsType: fromMfs.mfsType,

      // ===== To MFS =====
      toMfsAccountName: toMfs.accountName,
      toMfsNumber: toMfs.mfsNumber,
      toMfsType: toMfs.mfsType,
    })
    .from(bankMFsCashModel)
    .leftJoin(
      fromBank,
      eq(bankMFsCashModel.fromBankAccountId, fromBank.bankAccountId)
    )
    .leftJoin(
      toBank,
      eq(bankMFsCashModel.toBankAccountId, toBank.bankAccountId)
    )
    .leftJoin(fromMfs, eq(bankMFsCashModel.fromMfsId, fromMfs.mfsId))
    .leftJoin(toMfs, eq(bankMFsCashModel.toMfsId, toMfs.mfsId))
}

// Get By Id
export const getBankMfsCashById = async (id: number) => {
  const bankToBankConversion = await db
    .select()
    .from(bankMFsCashModel)
    .where(eq(bankMFsCashModel.id, id))
    .limit(1)

  if (!bankToBankConversion.length) {
    throw BadRequestError('Cloth bankToBankConversion not found')
  }

  return bankToBankConversion[0]
}

// Update
export const editBankMfsCash = async (
  id: number,
  bankToBankConversionData: Partial<NewBankMfsCash>
) => {
  const [updatedBankMfsCash] = await db
    .update(bankMFsCashModel)
    .set(bankToBankConversionData)
    .where(eq(bankMFsCashModel.id, id))

  if (!updatedBankMfsCash) {
    throw BadRequestError('Cloth bankToBankConversion not found')
  }

  return updatedBankMfsCash
}

// Delete
export const deleteBankMfsCash = async (id: number) => {
  const result = await db
    .delete(bankMFsCashModel)
    .where(eq(bankMFsCashModel.id, id))
  return { message: 'Fees Group deleted successfully' }
}
