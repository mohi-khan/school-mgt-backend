import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { examsModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExam,
  deleteExam,
  editExam,
  getAllExams,
  getExamById,
} from '../services/exams.service'

// Schema validation
const createExamSchema = createInsertSchema(examsModel).omit({
  examId: true,
  createdAt: true,
})

const editExamSchema = createExamSchema.partial()

export const createExamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_exam')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const data = {
      ...req.body,
      tenantId,
    }
    const examsData = createExamSchema.parse(data)
    const exams = await createExam(examsData)

    res.status(201).json({
      status: 'success',
      data: exams,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExamsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_exam')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const examss = await getAllExams(tenantId)

    res.status(200).json(examss)
  } catch (error) {
    next(error)
  }
}

export const getExamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_exam')
    const id = Number(req.params.id)
    const exams = await getExamById(id)

    res.status(200).json(exams)
  } catch (error) {
    next(error)
  }
}

export const editExamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_exam')
    const id = Number(req.params.id)
    const examsData = editExamSchema.parse(req.body)
    const exams = await editExam(id, examsData)

    res.status(200).json(exams)
  } catch (error) {
    next(error)
  }
}

export const deleteExamController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_exam')
    const examId = Number(req.params.id);

    const result = await deleteExam(examId);

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
