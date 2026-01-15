import { Request, Response } from 'express'
import {
  currentMonthSchoolSummary,
  getCurrentYearMonthlyExpense,
  getCurrentYearMonthlyIncome,
} from '../services/dashboard.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const currentMonthSchoolSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_dashboard')

    const summary = await currentMonthSchoolSummary()

    res.status(200).json({
      success: true,
      totalBalance: Number(summary.totalBalance ?? 0),
      totalCash: Number(summary.cashBalance ?? 0),
      totalBank: Number(summary.bankBalance ?? 0),
      totalMfs: Number(summary.mfsBalance ?? 0),
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch monthly school summary',
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

export const getCurrentYearMonthlyExpenseController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_dashboard')
    const data = await getCurrentYearMonthlyExpense()

    res.status(200).json(data)
  } catch (error) {
    console.error('Monthly Expense Error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly expense',
    })
  }
}
