import { getUsers } from '../services/auth.service'
import { requirePermission } from '../services/utils/jwt.utils'
import { Request, Response, NextFunction } from 'express'
export const getUserList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    requirePermission(req, 'view_user')
    const tenantId = req.user?.tenantId
    if (tenantId === undefined) {
      throw new Error('Tenant ID is required')
    }
    const users = await getUsers(tenantId)
    res.json(users)
  } catch (err) {
    next(err)
  }
}
