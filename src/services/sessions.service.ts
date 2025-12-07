import { db } from "../config/database"
import { sessionsModel } from "../schemas"

export const getAllSessions = async () => {
  return await db.select().from(sessionsModel)
}