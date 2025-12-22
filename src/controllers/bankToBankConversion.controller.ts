import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { bankToBankConversionModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createBankToBankConversion,
  deleteBankToBankConversion,
  editBankToBankConversion,
  getAllBankToBankConversions,
  getBankToBankConversionById,
} from '../services/bankToBankConversion.service'
import { z } from 'zod'

const dateStringToDate = z.preprocess(
  (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : undefined),
  z.date()
);

// Schema validation
const createBankToBankConversionSchema = createInsertSchema(
  bankToBankConversionModel
).omit({
  conversionId: true,
  createdAt: true,
}).extend({
    date: dateStringToDate
})

const editBankToBankConversionSchema =
  createBankToBankConversionSchema.partial().extend({
    date: dateStringToDate.optional(),
  })

export const createBankToBankConversionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_bank_to_bank_conversion')
    const bankToBankConversionData = createBankToBankConversionSchema.parse(
      req.body
    )
    const bankToBankConversion = await createBankToBankConversion(
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

export const getAllBankToBankConversionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_to_bank_conversion')
    const bankToBankConversions = await getAllBankToBankConversions()

    res.status(200).json(bankToBankConversions)
  } catch (error) {
    next(error)
  }
}

export const getBankToBankConversionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_to_bank_conversion')
    const id = Number(req.params.id)
    const bankToBankConversion = await getBankToBankConversionById(id)

    res.status(200).json(bankToBankConversion)
  } catch (error) {
    next(error)
  }
}

export const editBankToBankConversionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_bank_to_bank_conversion')
    const id = Number(req.params.id)
    const bankToBankConversionData = editBankToBankConversionSchema.parse(
      req.body
    )
    const bankToBankConversion = await editBankToBankConversion(
        id,
        bankToBankConversionData
    )
    console.log("🚀 ~ editBankToBankConversionController ~ req.body:", req.body)

    res.status(200).json(bankToBankConversion)
  } catch (error) {
    next(error)
  }
}

export const deleteBankToBankConversionController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'delete_bank_to_bank_conversion')
    const conversionId = Number(req.params.id)

    const result = await deleteBankToBankConversion(conversionId)

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
