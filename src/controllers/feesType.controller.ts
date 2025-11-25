import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { feesTypeModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createFeesType,
  deleteFeesType,
  editFeesType,
  getAllFeesTypes,
  getFeesTypeById,
} from '../services/feesType.service'

// Schema validation
const createFeesTypeSchema = createInsertSchema(feesTypeModel).omit({
  feesTypeId: true,
  createdAt: true,
})

const editFeesTypeSchema = createFeesTypeSchema.partial()

export const createFeesTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_account_head')
    const feesTypeData = createFeesTypeSchema.parse(req.body)
    const feesType = await createFeesType(feesTypeData)

    res.status(201).json({
      status: 'success',
      data: feesType,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllFeesTypesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_account_head')
    const feesTypes = await getAllFeesTypes()

    res.status(200).json(feesTypes)
  } catch (error) {
    next(error)
  }
}

export const getFeesTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_account_head')
    const id = Number(req.params.id)
    const feesType = await getFeesTypeById(id)

    res.status(200).json(feesType)
  } catch (error) {
    next(error)
  }
}

export const editFeesTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'edit_account_head')
    const id = Number(req.params.id)
    const feesTypeData = editFeesTypeSchema.parse(req.body)
    const feesType = await editFeesType(id, feesTypeData)

    res.status(200).json(feesType)
  } catch (error) {
    next(error)
  }
}

export const deleteFeesTypeController = async (req: Request, res: Response) => {
  try {
    const feesTypeId = Number(req.params.id);

    const result = await deleteFeesType(feesTypeId);

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
