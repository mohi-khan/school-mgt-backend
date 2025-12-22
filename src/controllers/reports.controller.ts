import { Request, Response } from 'express'
import { expenseReport, incomeReport, studentBankPaymentReport, studentCashPaymentReport, studentMfsPaymentReport, studentPaymentReport } from '../services/reports.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const studentPaymentReportController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_report')
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

export const studentBankPaymentReportController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_report')
    const { fromDate, toDate } = req.query

    if (!fromDate || !toDate) {
      res.status(400).json({
        message: 'fromDate and toDate are required',
      })
    }

    const data = await studentBankPaymentReport(
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

export const studentMfsPaymentReportController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_report')
    const { fromDate, toDate } = req.query

    if (!fromDate || !toDate) {
      res.status(400).json({
        message: 'fromDate and toDate are required',
      })
    }

    const data = await studentMfsPaymentReport(
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

export const studentCashPaymentReportController = async (
  req: Request,
  res: Response
) => {
  try {
    requirePermission(req, 'view_report')
    const { fromDate, toDate } = req.query

    if (!fromDate || !toDate) {
      res.status(400).json({
        message: 'fromDate and toDate are required',
      })
    }

    const data = await studentCashPaymentReport(
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

export const incomeReportController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_report')
    const { fromDate, toDate } = req.query

    const data = await incomeReport(fromDate as string, toDate as string)

    res.status(200).json(data)
  } catch (error) {
    console.error('Income report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income report',
    })
  }
}

export const expenseReportController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_report')
    const { fromDate, toDate } = req.query

    const data = await expenseReport(fromDate as string, toDate as string)

    res.status(200).json(data)
  } catch (error) {
    console.error('Expense report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense report',
    })
  }
}
