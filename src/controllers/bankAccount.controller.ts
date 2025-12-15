import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { bankAccountModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createBankAccount,
  deleteBankAccount,
  editBankAccount,
  getAllBankAccounts,
  getBankAccountById,
} from '../services/bankAccount.service'

// Schema validation
const createBankAccountSchema = createInsertSchema(bankAccountModel).omit({
  bankAccountId: true,
  createdAt: true,
})

const editBankAccountSchema = createBankAccountSchema.partial()

export const createBankAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_expense_head')
    const bankAccountData = createBankAccountSchema.parse(req.body)
    const bankAccount = await createBankAccount(bankAccountData)

    res.status(201).json({
      status: 'success',
      data: bankAccount,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllBankAccountsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense_head')
    const bankAccounts = await getAllBankAccounts()

    res.status(200).json(bankAccounts)
  } catch (error) {
    next(error)
  }
}

export const getBankAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense_head')
    const id = Number(req.params.id)
    const bankAccount = await getBankAccountById(id)

    res.status(200).json(bankAccount)
  } catch (error) {
    next(error)
  }
}

export const editBankAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_expense_head')
    const id = Number(req.params.id)
    const bankAccountData = editBankAccountSchema.parse(req.body)
    const bankAccount = await editBankAccount(id, bankAccountData)

    res.status(200).json(bankAccount)
  } catch (error) {
    next(error)
  }
}

export const deleteBankAccountController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_expense_head')
    const bankAccountId = Number(req.params.id);

    const result = await deleteBankAccount(bankAccountId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
