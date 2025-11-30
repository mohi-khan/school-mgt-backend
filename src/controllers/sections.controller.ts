import { NextFunction, Request, Response } from 'express'
import { getAllSectionss } from '../services/sections.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const getAllSectionssController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_section')
    const accountHeads = await getAllSectionss()

    res.status(200).json(accountHeads)
  } catch (error) {
    next(error)
  }
}
