import { Request, Response } from 'express'
import { currentMonthPaymentSummary, getCurrentYearMonthlyIncome } from '../services/dashboard.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const currentMonthPaymentSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_dashboard')
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

export const getCurrentYearMonthlyIncomeController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_dashboard')
    const data = await getCurrentYearMonthlyIncome()

    res.status(200).json(data)
  } catch (error) {
    console.error('Monthly Income Error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly income',
    })
  }
}