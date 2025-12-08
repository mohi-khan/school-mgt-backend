import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { examSubjectsModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExamSubjects,
  deleteExamSubjects,
  editExamSubjects,
  getAllExamSubjectss,
  getExamSubjectsById,
} from '../services/examSubjects.service'
import { z } from 'zod'

const dateStringToDate = z.preprocess(
  (arg) =>
    typeof arg === 'string' || arg instanceof Date ? new Date(arg) : undefined,
  z.date()
)

// Schema validation
const createExamSubjectsSchema = createInsertSchema(examSubjectsModel)
  .omit({
    examSubjectId: true,
    createdAt: true,
  })
  .extend({
    examDate: dateStringToDate,
  })

const editExamSubjectsSchema = createExamSubjectsSchema.partial()

export const createExamSubjectsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_exam_subject')
    const examSubjectsData = createExamSubjectsSchema.parse(req.body)
    const examSubjects = await createExamSubjects(examSubjectsData)

    res.status(201).json({
      status: 'success',
      data: examSubjects,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExamSubjectssController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_exam_subject')
    const examSubjectss = await getAllExamSubjectss()

    res.status(200).json(examSubjectss)
  } catch (error) {
    next(error)
  }
}

export const getExamSubjectsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_exam_subject')
    const id = Number(req.params.id)
    const examSubjects = await getExamSubjectsById(id)

    res.status(200).json(examSubjects)
  } catch (error) {
    next(error)
  }
}

export const editExamSubjectsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_exam_subject')
    const id = Number(req.params.id)
    const examSubjectsData = editExamSubjectsSchema.parse(req.body)
    const examSubjects = await editExamSubjects(id, examSubjectsData)

    res.status(200).json(examSubjects)
  } catch (error) {
    next(error)
  }
}

export const deleteExamSubjectsController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'delete_exam_subject')
    const examSubjectsId = Number(req.params.id)

    const result = await deleteExamSubjects(examSubjectsId)

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
