import { eq } from 'drizzle-orm'
import { db } from '../config/database'
import { bankAccountModel, NewBankAccount } from '../schemas'
import { BadRequestError } from './utils/errors.utils'

// Create
export const createBankAccount = async (
  bankAccountData: Omit<NewBankAccount, 'bankAccountId' | 'updatedAt' | 'updatedBy'>
) => {
  try {
    const [newBankAccount] = await db.insert(bankAccountModel).values({
      ...bankAccountData,
      createdAt: new Date(),
    })

    return newBankAccount
  } catch (error) {
    throw error
  }
}

// Get All
export const getAllBankAccounts = async () => {
  return await db.select().from(bankAccountModel)
}

// Get By Id
export const getBankAccountById = async (bankAccountId: number) => {
  const bankAccount = await db
    .select()
    .from(bankAccountModel)
    .where(eq(bankAccountModel.bankAccountId, bankAccountId))
    .limit(1)

  if (!bankAccount.length) {
    throw BadRequestError('Cloth bankAccount not found')
  }

  return bankAccount[0]
}

// Update
export const editBankAccount = async (
  bankAccountId: number,
  bankAccountData: Partial<NewBankAccount>
) => {
  const [updatedBankAccount] = await db
    .update(bankAccountModel)
    .set(bankAccountData)
    .where(eq(bankAccountModel.bankAccountId, bankAccountId))

  if (!updatedBankAccount) {
    throw BadRequestError('Cloth bankAccount not found')
  }

  return updatedBankAccount
}

// Delete
export const deleteBankAccount = async (bankAccountId: number) => {
  const result = await db
    .delete(bankAccountModel)
    .where(eq(bankAccountModel.bankAccountId, bankAccountId));
  return { message: "Fees Group deleted successfully" };
};
