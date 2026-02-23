import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { openingBalanceModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createOpeningBalance,
  getAllOpeningBalances,
} from '../services/openingBalance.service'

// Schema validation
const createOpeningBalanceSchema = createInsertSchema(openingBalanceModel).omit({
  openingBalanceId: true,
  createdAt: true,
})

export const createOpeningBalanceController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_bank_account')
    const openingBalanceData = createOpeningBalanceSchema.parse(req.body)
    const openingBalance = await createOpeningBalance(openingBalanceData)

    res.status(201).json({
      status: 'success',
      data: openingBalance,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllOpeningBalancesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_bank_account')
    const openingBalances = await getAllOpeningBalances()

    res.status(200).json(openingBalances)
  } catch (error) {
    next(error)
  }
}