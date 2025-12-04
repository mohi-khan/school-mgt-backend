import { Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  collectFees,
  getStudentFeesById,
} from '../services/student-fees.service'

export const collectFeesController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'collect_student_fees')

    const body = req.body

    if (!body.studentFeesId) {
      return res.status(400).json({
        success: false,
        message: 'studentFeesId is required',
      })
    }

    if (!body.paidAmount || body.paidAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'paidAmount is required & must be > 0',
      })
    }

    if (!body.method) {
      return res.status(400).json({
        success: false,
        message: 'payment method is required',
      })
    }

    if (!body.paymentDate) {
      return res.status(400).json({
        success: false,
        message: 'paymentDate is required',
      })
    }

    const result = await collectFees(body)

    return res.status(200).json(result)
  } catch (error: any) {
    return res.status(400).json({
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
