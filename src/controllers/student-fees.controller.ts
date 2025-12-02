import { Request, Response } from 'express'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  collectFees,
  getStudentFeesById,
} from '../services/student-fees.service'

export const collectFeesController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'collect_student_fees')
    const fees = req.body

    if (!Array.isArray(fees) || fees.length === 0) {
      res
        .status(400)
        .json({ success: false, message: 'Fees array is required' })
    }

    // Validate each fee object
    for (const fee of fees) {
      if (!fee.studentFeesId) {
        res
          .status(400)
          .json({
            success: false,
            message: 'studentFeesId is required for each fee',
          })
      }
      if (!fee.paymentType || !['Paid', 'Partial'].includes(fee.paymentType)) {
        res
          .status(400)
          .json({ success: false, message: 'Invalid paymentType for each fee' })
      }
    }

    // Call service
    const result = await collectFees(fees)

    res.status(200).json({
      success: true,
      message: 'Fees updated successfully',
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
