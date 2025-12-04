import type { Request, Response } from 'express'
import { promoteStudents } from '../services/studentPromotions.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const promoteStudentsController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'promote_student')
    const input = req.body

    const result = await promoteStudents(input)

    res.status(200).json(result)
  } catch (err: any) {
    res.status(500).json({
      message: 'Student promotion failed',
      error: err.message,
    })
  }
}
