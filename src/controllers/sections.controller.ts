import { NextFunction, Request, Response } from 'express'
import { getAllSectionss } from '../services/sections.service'

export const getAllSectionssController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_account_head')
    const accountHeads = await getAllSectionss()

    res.status(200).json(accountHeads)
  } catch (error) {
    next(error)
  }
}
