import { Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  collectFees,
  getStudentFeesById,
} from '../services/student-fees.service'

export const collectFeesController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'collect_student_fees')

    const result = await collectFees(req.body)

    res.status(200).json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong',
    })
  }
}

export const getStudentFeesByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_student_fees')
    const { studentId } = req.params

    if (!studentId) {
      res.status(400).json({ success: false, message: 'studentId is required' })
    }

    // Call service
    const fees = await getStudentFeesById(Number(studentId))

    res.status(200).json(fees)
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Something went wrong',
    })
  }
}
