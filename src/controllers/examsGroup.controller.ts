import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { examsGroupModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createExamsGroup,
  deleteExamsGroup,
  editExamsGroup,
  getAllExamsGroups,
  getExamsGroupById,
} from '../services/examsGroup.service'

// Schema validation
const createExamsGroupSchema = createInsertSchema(examsGroupModel).omit({
  examsGroupId: true,
  createdAt: true,
})

const editExamsGroupSchema = createExamsGroupSchema.partial()

export const createExamsGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_fees_group')
    const examsGroupData = createExamsGroupSchema.parse(req.body)
    const examsGroup = await createExamsGroup(examsGroupData)

    res.status(201).json({
      status: 'success',
      data: examsGroup,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllExamsGroupsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_fees_group')
    const examsGroups = await getAllExamsGroups()

    res.status(200).json(examsGroups)
  } catch (error) {
    next(error)
  }
}

export const getExamsGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_fees_group')
    const id = Number(req.params.id)
    const examsGroup = await getExamsGroupById(id)

    res.status(200).json(examsGroup)
  } catch (error) {
    next(error)
  }
}

export const editExamsGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_fees_group')
    const id = Number(req.params.id)
    const examsGroupData = editExamsGroupSchema.parse(req.body)
    const examsGroup = await editExamsGroup(id, examsGroupData)

    res.status(200).json(examsGroup)
  } catch (error) {
    next(error)
  }
}

export const deleteExamsGroupController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_fees_group')
    const examsGroupId = Number(req.params.id);

    const result = await deleteExamsGroup(examsGroupId);

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
