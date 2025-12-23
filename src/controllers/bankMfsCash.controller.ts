import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { bankMFsCashModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createBankMfsCash,
  deleteBankMfsCash,
  editBankMfsCash,
  getAllBankMfsCash,
  getBankMfsCashById,
} from '../services/bankMfsCash.service'
import { z } from 'zod'

const dateStringToDate = z.preprocess(
  (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : undefined),
  z.date()
);

// Schema validation
const createBankMfsCashSchema = createInsertSchema(
  bankMFsCashModel
).omit({
  id: true,
  createdAt: true,
}).extend({
    date: dateStringToDate
})

const editBankMfsCashSchema =
  createBankMfsCashSchema.partial().extend({
    date: dateStringToDate.optional(),
  })

export const createBankMfsCashController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_bank_mfs_cash')
    const bankToBankConversionData = createBankMfsCashSchema.parse(
      req.body
    )
    const bankToBankConversion = await createBankMfsCash(
      bankToBankConversionData
    )

    res.status(201).json({
      status: 'success',
      data: bankToBankConversion,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllBankMfsCashController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_mfs_cash')
    const bankToBankConversions = await getAllBankMfsCash()

    res.status(200).json(bankToBankConversions)
  } catch (error) {
    next(error)
  }
}

export const getBankMfsCashController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_mfs_cash')
    const id = Number(req.params.id)
    const bankToBankConversion = await getBankMfsCashById(id)

    res.status(200).json(bankToBankConversion)
  } catch (error) {
    next(error)
  }
}

export const editBankMfsCashController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_bank_mfs_cash')
    const id = Number(req.params.id)
    const bankToBankConversionData = editBankMfsCashSchema.parse(
      req.body
    )
    const bankToBankConversion = await editBankMfsCash(
        id,
        bankToBankConversionData
    )
    console.log("🚀 ~ editBankMfsCashController ~ req.body:", req.body)

    res.status(200).json(bankToBankConversion)
  } catch (error) {
    next(error)
  }
}

export const deleteBankMfsCashController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'delete_bank_mfs_cash')
    const id = Number(req.params.id)

    const result = await deleteBankMfsCash(id)

    res.status(200).json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong',
    })
  }
}
