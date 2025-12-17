import { NextFunction, Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import { getSectionsByClassId } from '../services/sections.service'

export const getSectionsByClassIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_section')

    const classId = req.query.classId
      ? Number(req.query.classId)
      : undefined

    const sections = await getSectionsByClassId(classId)

    res.status(200).json(sections)
  } catch (error) {
    next(error)
  }
}

