import { Request, Response } from 'express'
import { currentMonthPaymentSummary } from '../services/dashboard.service'

export const currentMonthPaymentSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    const [summary] = await currentMonthPaymentSummary()

    res.status(200).json({
        totalCash: Number(summary?.totalCash ?? 0),
        totalBank: Number(summary?.totalBank ?? 0),
        totalMfs: Number(summary?.totalMfs ?? 0),
      })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch monthly payment summary',
    })
  }
}
