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
    requirePermission(req, 'create_opening_balance')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const data = {
      ...req.body,
      tenantId,
    }
    const openingBalanceData = createOpeningBalanceSchema.parse(data)
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
    requirePermission(req, 'view_opening_balance')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const openingBalances = await getAllOpeningBalances(tenantId)

    res.status(200).json(openingBalances)
  } catch (error) {
    next(error)
  }
}