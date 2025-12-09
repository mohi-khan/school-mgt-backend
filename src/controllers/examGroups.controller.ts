import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { examGroupsModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExamGroup,
  deleteExamGroup,
  editExamGroup,
  getAllExamGroups,
  getExamGroupById,
} from '../services/examGroups.service'

// Schema validation
const createExamGroupSchema = createInsertSchema(examGroupsModel).omit({
  examGroupsId: true,
  createdAt: true,
})

const editExamGroupSchema = createExamGroupSchema.partial()

export const createExamGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_exam_group')
    const examGroupsData = createExamGroupSchema.parse(req.body)
    const examGroups = await createExamGroup(examGroupsData)

    res.status(201).json({
      status: 'success',
      data: examGroups,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExamGroupsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_exam_group')
    const examGroupss = await getAllExamGroups()

    res.status(200).json(examGroupss)
  } catch (error) {
    next(error)
  }
}

export const getExamGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_exam_group')
    const id = Number(req.params.id)
    const examGroups = await getExamGroupById(id)

    res.status(200).json(examGroups)
  } catch (error) {
    next(error)
  }
}

export const editExamGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_exam_group')
    const id = Number(req.params.id)
    const examGroupsData = editExamGroupSchema.parse(req.body)
    const examGroups = await editExamGroup(id, examGroupsData)

    res.status(200).json(examGroups)
  } catch (error) {
    next(error)
  }
}

export const deleteExamGroupController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_exam_group')
    const examGroupsId = Number(req.params.id);

    const result = await deleteExamGroup(examGroupsId);

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
