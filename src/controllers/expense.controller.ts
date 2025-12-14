import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { expenseModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExpense,
  deleteExpense,
  editExpense,
  getAllExpenses,
  getExpenseById,
} from '../services/expense.service'
import { z } from 'zod'

const dateStringToDate = z.preprocess(
  (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : undefined),
  z.date()
);

// Schema validation
const createExpenseSchema = createInsertSchema(expenseModel).omit({
  expenseId: true,
  createdAt: true,
}).extend({
    date: dateStringToDate
})

const editExpenseSchema = createExpenseSchema.partial()

export const createExpenseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_expense')
    const expenseData = createExpenseSchema.parse(req.body)
    const expense = await createExpense(expenseData)

    res.status(201).json({
      status: 'success',
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExpensesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense')
    const expenses = await getAllExpenses()

    res.status(200).json(expenses)
  } catch (error) {
    next(error)
  }
}

export const getExpenseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_expense')
    const id = Number(req.params.id)
    const expense = await getExpenseById(id)

    res.status(200).json(expense)
  } catch (error) {
    next(error)
  }
}

export const editExpenseController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_expense')
    const id = Number(req.params.id)
    const expenseData = editExpenseSchema.parse(req.body)
    const expense = await editExpense(id, expenseData)

    res.status(200).json(expense)
  } catch (error) {
    next(error)
  }
}

export const deleteExpenseController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_expense')
    const expenseId = Number(req.params.id);

    const result = await deleteExpense(expenseId);

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
