import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { examsGroupModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExamGroup,
  deleteExamGroup,
  editExamGroup,
  getAllExamGroups,
  getExamGroupById,
} from '../services/examsGroup.service'

// Schema validation
const createExamGroupSchema = createInsertSchema(examsGroupModel).omit({
  examsGroupId: true,
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
    const examsGroupData = createExamGroupSchema.parse(req.body)
    const examsGroup = await createExamGroup(examsGroupData)

    res.status(201).json({
      status: 'success',
      data: examsGroup,
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
    const examsGroups = await getAllExamGroups()

    res.status(200).json(examsGroups)
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
    const examsGroup = await getExamGroupById(id)

    res.status(200).json(examsGroup)
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
    const examsGroupData = editExamGroupSchema.parse(req.body)
    const examsGroup = await editExamGroup(id, examsGroupData)

    res.status(200).json(examsGroup)
  } catch (error) {
    next(error)
  }
}

export const deleteExamGroupController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_exam_group')
    const examsGroupId = Number(req.params.id);

    const result = await deleteExamGroup(examsGroupId);

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
