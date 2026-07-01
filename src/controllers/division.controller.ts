import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { divisionModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createDivision,
  deleteDivision,
  editDivision,
  getAllDivisions,
  getDivisionById,
} from '../services/division.service'

// Schema validation
const createDivisionSchema = createInsertSchema(divisionModel).omit({
  divisionId: true,
  createdAt: true,
})

const editDivisionSchema = createDivisionSchema.partial()

export const createDivisionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'create_division')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const data = {
      ...req.body,
      tenantId,
    }
    const divisionData = createDivisionSchema.parse(data)
    const division = await createDivision(divisionData)

    res.status(201).json({
      status: 'success',
      data: division,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllDivisionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_division')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const divisions = await getAllDivisions(tenantId)

    res.status(200).json(divisions)
  } catch (error) {
    next(error)
  }
}

export const getDivisionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_division')
    const id = Number(req.params.id)
    const division = await getDivisionById(id)

    res.status(200).json(division)
  } catch (error) {
    next(error)
  }
}

export const editDivisionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'edit_division')
    const id = Number(req.params.id)
    const divisionData = editDivisionSchema.parse(req.body)
    const division = await editDivision(id, divisionData)

    res.status(200).json(division)
  } catch (error) {
    next(error)
  }
}

export const deleteDivisionController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'delete_division')
    const divisionId = Number(req.params.id);

    const result = await deleteDivision(divisionId);

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
