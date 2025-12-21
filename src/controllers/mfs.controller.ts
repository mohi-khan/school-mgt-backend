import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { mfsModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createMfs,
  deleteMfs,
  editMfs,
  getAllMfss,
  getMfsById,
} from '../services/mfs.service'

// Schema validation
const createMfsSchema = createInsertSchema(mfsModel).omit({
  mfsId: true,
  createdAt: true,
})

const editMfsSchema = createMfsSchema.partial()

export const createMfsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_expense_head')
    const mfsData = createMfsSchema.parse(req.body)
    const mfs = await createMfs(mfsData)

    res.status(201).json({
      status: 'success',
      data: mfs,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllMfssController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense_head')
    const mfss = await getAllMfss()

    res.status(200).json(mfss)
  } catch (error) {
    next(error)
  }
}

export const getMfsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense_head')
    const id = Number(req.params.id)
    const mfs = await getMfsById(id)

    res.status(200).json(mfs)
  } catch (error) {
    next(error)
  }
}

export const editMfsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_expense_head')
    const id = Number(req.params.id)
    const mfsData = editMfsSchema.parse(req.body)
    const mfs = await editMfs(id, mfsData)

    res.status(200).json(mfs)
  } catch (error) {
    next(error)
  }
}

export const deleteMfsController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_expense_head')
    const mfsId = Number(req.params.id);

    const result = await deleteMfs(mfsId);

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
