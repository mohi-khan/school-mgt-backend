import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import {
  bankAccountModel,
  bankToBankConversionModel,
  NewBankToBankConversion,
} from '../schemas'
import { BadRequestError } from './utils/errors.utils'
import { alias } from 'drizzle-orm/mysql-core'

// Create
export const createBankToBankConversion = async (
  bankToBankConversionData: Omit<
    NewBankToBankConversion,
    'conversionId' | 'updatedAt' | 'updatedBy'
  >
) => {
  try {
    const [newBankToBankConversion] = await db
      .insert(bankToBankConversionModel)
      .values({
        ...bankToBankConversionData,
        createdAt: new Date(),
      })

    return newBankToBankConversion
  } catch (error) {
    throw error
  }
}

// Get All
const fromBank = alias(bankAccountModel, 'fromBank')
const toBank = alias(bankAccountModel, 'toBank')

export const getAllBankToBankConversions = async () => {
  return await db
    .select({
      // ===== Conversion table fields =====
      conversionId: bankToBankConversionModel.conversionId,
      fromBankAccountId: bankToBankConversionModel.fromBankAccountId,
      toBankAccountId: bankToBankConversionModel.toBankAccountId,
      amount: bankToBankConversionModel.amount,
      date: bankToBankConversionModel.date,
      description: bankToBankConversionModel.description,
      createdBy: bankToBankConversionModel.createdBy,
      createdAt: bankToBankConversionModel.createdAt,
      updatedBy: bankToBankConversionModel.updatedBy,
      updatedAt: bankToBankConversionModel.updatedAt,

      // ===== From bank account fields =====
      fromBankName: fromBank.bankName,
      fromAccountNumber: fromBank.accountNumber,
      fromBranch: fromBank.branch,
      fromAccountName: fromBank.accountName,

      // ===== To bank account fields =====
      toBankName: toBank.bankName,
      toAccountNumber: toBank.accountNumber,
      toBranch: toBank.branch,
      toAccountName: toBank.accountName,
    })
    .from(bankToBankConversionModel)
    .innerJoin(
      fromBank,
      eq(bankToBankConversionModel.fromBankAccountId, fromBank.bankAccountId)
    )
    .innerJoin(
      toBank,
      eq(bankToBankConversionModel.toBankAccountId, toBank.bankAccountId)
    )
}

// Get By Id
export const getBankToBankConversionById = async (conversionId: number) => {
  const bankToBankConversion = await db
    .select()
    .from(bankToBankConversionModel)
    .where(eq(bankToBankConversionModel.conversionId, conversionId))
    .limit(1)

  if (!bankToBankConversion.length) {
    throw BadRequestError('Cloth bankToBankConversion not found')
  }

  return bankToBankConversion[0]
}

// Update
export const editBankToBankConversion = async (
  conversionId: number,
  bankToBankConversionData: Partial<NewBankToBankConversion>
) => {
  const [updatedBankToBankConversion] = await db
    .update(bankToBankConversionModel)
    .set(bankToBankConversionData)
    .where(eq(bankToBankConversionModel.conversionId, conversionId))

  if (!updatedBankToBankConversion) {
    throw BadRequestError('Cloth bankToBankConversion not found')
  }

  return updatedBankToBankConversion
}

// Delete
export const deleteBankToBankConversion = async (conversionId: number) => {
  const result = await db
    .delete(bankToBankConversionModel)
    .where(eq(bankToBankConversionModel.conversionId, conversionId))
  return { message: 'Fees Group deleted successfully' }
}
