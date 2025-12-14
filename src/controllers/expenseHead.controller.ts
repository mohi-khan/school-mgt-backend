import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { expenseHeadModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExpenseHead,
  deleteExpenseHead,
  editExpenseHead,
  getAllExpenseHeads,
  getExpenseHeadById,
} from '../services/expenseHead.service'

// Schema validation
const createExpenseHeadSchema = createInsertSchema(expenseHeadModel).omit({
  expenseHeadId: true,
  createdAt: true,
})

const editExpenseHeadSchema = createExpenseHeadSchema.partial()

export const createExpenseHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_expense_head')
    const expenseHeadData = createExpenseHeadSchema.parse(req.body)
    const expenseHead = await createExpenseHead(expenseHeadData)

    res.status(201).json({
      status: 'success',
      data: expenseHead,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExpenseHeadsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense_head')
    const expenseHeads = await getAllExpenseHeads()

    res.status(200).json(expenseHeads)
  } catch (error) {
    next(error)
  }
}

export const getExpenseHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense_head')
    const id = Number(req.params.id)
    const expenseHead = await getExpenseHeadById(id)

    res.status(200).json(expenseHead)
  } catch (error) {
    next(error)
  }
}

export const editExpenseHeadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_expense_head')
    const id = Number(req.params.id)
    const expenseHeadData = editExpenseHeadSchema.parse(req.body)
    const expenseHead = await editExpenseHead(id, expenseHeadData)

    res.status(200).json(expenseHead)
  } catch (error) {
    next(error)
  }
}

export const deleteExpenseHeadController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_expense_head')
    const expenseHeadId = Number(req.params.id);

    const result = await deleteExpenseHead(expenseHeadId);

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
