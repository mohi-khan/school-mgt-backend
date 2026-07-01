import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { feesMasterModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createFeesMaster,
  deleteFeesMaster,
  editFeesMaster,
  getAllFeesMasters,
  getFeesMasterById,
} from '../services/feesMaster.service'
import { z } from 'zod'

const dateStringToDate = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : undefined,
  z.date()
)

// Schema validation
const createFeesMasterSchema = createInsertSchema(feesMasterModel)
  .omit({
    feesMasterId: true,
    createdAt: true,
  })
  .extend({
    dueDate: dateStringToDate,
  })

const editFeesMasterSchema = createFeesMasterSchema.partial()

export const createFeesMasterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_fees_master')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const data = {
      ...req.body,
      tenantId,
    }

    const payload = Array.isArray(data) ? data : [data]

    // validate each item using SAME schema
    const validatedData = payload.map((item) =>
      createFeesMasterSchema.parse(item)
    )

    const feesMasters = await createFeesMaster(validatedData)

    res.status(201).json({
      status: 'success',
      data: feesMasters,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllFeesMastersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_fees_master')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const feesMasters = await getAllFeesMasters(tenantId)

    res.status(200).json(feesMasters)
  } catch (error) {
    next(error)
  }
}

export const getFeesMasterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_fess_master')
    const id = Number(req.params.id)
    const feesMaster = await getFeesMasterById(id)

    res.status(200).json(feesMaster)
  } catch (error) {
    next(error)
  }
}

export const editFeesMasterController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_fees_master')
    const id = Number(req.params.id)
    const feesMasterData = editFeesMasterSchema.parse(req.body)
    const feesMaster = await editFeesMaster(id, feesMasterData)

    res.status(200).json(feesMaster)
  } catch (error) {
    next(error)
  }
}

export const deleteFeesMasterController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'delete_fees_master')
    const feesMasterId = Number(req.params.id)

    const result = await deleteFeesMaster(feesMasterId)

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
