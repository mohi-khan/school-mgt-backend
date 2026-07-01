import { Request, Response } from 'express'
import {
  getOverallSchoolSummary,
  getCurrentYearMonthlyExpense,
  getCurrentYearMonthlyIncome,
} from '../services/dashboard.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const getOverallSchoolSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_dashboard')

    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }

    const summary = await getOverallSchoolSummary(tenantId)

    res.status(200).json({
      success: true,
      totalBalance: Number(summary.totalBalance),
      totalCash: Number(summary.cashBalance),
      totalBank: Number(summary.bankBalance),
      totalMfs: Number(summary.mfsBalance),
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch school summary',
    })
  }
}
export const getCurrentYearMonthlyIncomeController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_dashboard')

    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const data = await getCurrentYearMonthlyIncome(tenantId)

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

    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const data = await getCurrentYearMonthlyExpense(tenantId)

    res.status(200).json(data)
  } catch (error) {
    console.error('Monthly Expense Error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly expense',
    })
  }
}
