import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { feesGroupModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createFeesGroup,
  editFeesGroup,
  getAllFeesGroups,
  getFeesGroupById,
} from '../services/feesGroup.service'

// Schema validation
const createFeesGroupSchema = createInsertSchema(feesGroupModel).omit({
  feesGroupId: true,
  createdAt: true,
})

const editFeesGroupSchema = createFeesGroupSchema.partial()

export const createFeesGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'create_account_head')
    const feesGroupData = createFeesGroupSchema.parse(req.body)
    const feesGroup = await createFeesGroup(feesGroupData)

    res.status(201).json({
      status: 'success',
      data: feesGroup,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllFeesGroupsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_account_head')
    const feesGroups = await getAllFeesGroups()

    res.status(200).json(feesGroups)
  } catch (error) {
    next(error)
  }
}

export const getFeesGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_account_head')
    const id = Number(req.params.id)
    const feesGroup = await getFeesGroupById(id)

    res.status(200).json(feesGroup)
  } catch (error) {
    next(error)
  }
}

export const editFeesGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_account_head')
    const id = Number(req.params.id)
    const feesGroupData = editFeesGroupSchema.parse(req.body)
    const feesGroup = await editFeesGroup(id, feesGroupData)

    res.status(200).json(feesGroup)
  } catch (error) {
    next(error)
  }
}
