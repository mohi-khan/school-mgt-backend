import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { incomeHeadModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createIncomeHead,
  deleteIncomeHead,
  editIncomeHead,
  getAllIncomeHeads,
  getIncomeHeadById,
} from '../services/incomeHead.service'

// Schema validation
const createIncomeHeadSchema = createInsertSchema(incomeHeadModel).omit({
  incomeHeadId: true,
  createdAt: true,
})

const editIncomeHeadSchema = createIncomeHeadSchema.partial()

export const createIncomeHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_income_head')
    const incomeHeadData = createIncomeHeadSchema.parse(req.body)
    const incomeHead = await createIncomeHead(incomeHeadData)

    res.status(201).json({
      status: 'success',
      data: incomeHead,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllIncomeHeadsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_income_head')
    const incomeHeads = await getAllIncomeHeads()

    res.status(200).json(incomeHeads)
  } catch (error) {
    next(error)
  }
}

export const getIncomeHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_income_head')
    const id = Number(req.params.id)
    const incomeHead = await getIncomeHeadById(id)

    res.status(200).json(incomeHead)
  } catch (error) {
    next(error)
  }
}

export const editIncomeHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_income_head')
    const id = Number(req.params.id)
    const incomeHeadData = editIncomeHeadSchema.parse(req.body)
    const incomeHead = await editIncomeHead(id, incomeHeadData)

    res.status(200).json(incomeHead)
  } catch (error) {
    next(error)
  }
}

export const deleteIncomeHeadController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_income_head')
    const incomeHeadId = Number(req.params.id);

    const result = await deleteIncomeHead(incomeHeadId);

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
