import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { examResultModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExamResult,
  deleteExamResult,
  editExamResult,
  getAllExamResults,
  getExamResultById,
} from '../services/examResult.service'

// Schema validation
const createExamResultSchema = createInsertSchema(examResultModel).omit({
  examResultId: true,
  createdAt: true,
})

const editExamResultSchema = createExamResultSchema.partial()

export const createExamResultController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_fees_group')
    const examResultData = createExamResultSchema.parse(req.body)
    const examResult = await createExamResult(examResultData)

    res.status(201).json({
      status: 'success',
      data: examResult,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExamResultsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_fees_group')
    const examResults = await getAllExamResults()

    res.status(200).json(examResults)
  } catch (error) {
    next(error)
  }
}

export const getExamResultController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_fees_group')
    const id = Number(req.params.id)
    const examResult = await getExamResultById(id)

    res.status(200).json(examResult)
  } catch (error) {
    next(error)
  }
}

export const editExamResultController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_fees_group')
    const id = Number(req.params.id)
    const examResultData = editExamResultSchema.parse(req.body)
    const examResult = await editExamResult(id, examResultData)

    res.status(200).json(examResult)
  } catch (error) {
    next(error)
  }
}

export const deleteExamResultController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_fees_group')
    const examResultId = Number(req.params.id);

    const result = await deleteExamResult(examResultId);

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
