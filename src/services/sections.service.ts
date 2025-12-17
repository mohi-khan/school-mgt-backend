import { and, eq } from 'drizzle-orm'
import { db } from '../config/database'
import { classSectionsModel, sectionsModel } from '../schemas'

export const getSectionsByClassId = async (classId?: number) => {
  // ✅ ONLY return all sections when classId is truly missing
  if (classId === undefined || Number.isNaN(classId)) {
    return await db.select().from(sectionsModel)
  } else {
    // ✅ classId exists → return sections under that class
    return await db
      .select({
        classSectionId: classSectionsModel.classSectionId,
        sectionId: sectionsModel.sectionId,
        sectionName: sectionsModel.sectionName,
        roomNo: classSectionsModel.roomNo,
        classTeacherId: classSectionsModel.classTeacherId,
        isActive: classSectionsModel.isActive,
      })
      .from(classSectionsModel)
      .innerJoin(
        sectionsModel,
        eq(classSectionsModel.sectionId, sectionsModel.sectionId)
      )
      .where(
        and(
          eq(classSectionsModel.classId, classId),
          eq(classSectionsModel.isActive, true)
        )
      )
  }
}
