import { db } from "../config/database"
import { sectionsModel } from "../schemas"

export const getAllSectionss = async () => {
  return await db.select().from(sectionsModel)
}