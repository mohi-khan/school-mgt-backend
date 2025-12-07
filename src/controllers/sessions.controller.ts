import { NextFunction, Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import { getAllSessions } from '../services/sessions.service'

export const getAllSessionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_session')
    const sessions = await getAllSessions()

    res.status(200).json(sessions)
  } catch (error) {
    next(error)
  }
}
