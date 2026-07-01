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
    requirePermission(req, 'create_exam_result')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const data = {
      ...req.body,
      tenantId,
    }
    const examResultData = createExamResultSchema.parse(data)
    console.log("🚀 ~ createExamResultController ~ data:", data)
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
    requirePermission(req, 'view_exam_result')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const examResults = await getAllExamResults(tenantId)

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
    requirePermission(req, 'view_exam_result')
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
    requirePermission(req, 'edit_exam_result')
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
    requirePermission(req, 'delete_exam_result')
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
