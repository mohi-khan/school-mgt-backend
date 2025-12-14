import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { incomeModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createIncome,
  deleteIncome,
  editIncome,
  getAllIncomes,
  getIncomeById,
} from '../services/income.service'

// Schema validation
const createIncomeSchema = createInsertSchema(incomeModel).omit({
  incomeId: true,
  createdAt: true,
})

const editIncomeSchema = createIncomeSchema.partial()

export const createIncomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_income_head')
    const incomeData = createIncomeSchema.parse(req.body)
    const income = await createIncome(incomeData)

    res.status(201).json({
      status: 'success',
      data: income,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllIncomesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_income_head')
    const incomes = await getAllIncomes()

    res.status(200).json(incomes)
  } catch (error) {
    next(error)
  }
}

export const getIncomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_income_head')
    const id = Number(req.params.id)
    const income = await getIncomeById(id)

    res.status(200).json(income)
  } catch (error) {
    next(error)
  }
}

export const editIncomeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_income_head')
    const id = Number(req.params.id)
    const incomeData = editIncomeSchema.parse(req.body)
    const income = await editIncome(id, incomeData)

    res.status(200).json(income)
  } catch (error) {
    next(error)
  }
}

export const deleteIncomeController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_income_head')
    const incomeId = Number(req.params.id);

    const result = await deleteIncome(incomeId);

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
