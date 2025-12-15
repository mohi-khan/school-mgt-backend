import { Request, Response } from 'express'
import { studentPaymentReport } from '../services/reports.service'

export const studentPaymentReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { fromDate, toDate } = req.query

    if (!fromDate || !toDate) {
      res.status(400).json({
        message: 'fromDate and toDate are required',
      })
    }

    const data = await studentPaymentReport(
      fromDate as string,
      toDate as string
    )

    res.status(200).json(data)
  } catch (error) {
    console.error('Payment report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment report',
    })
  }
}
