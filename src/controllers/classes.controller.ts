import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { classesModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createClasses,
  deleteClassesService,
  editClasses,
  getAllClasses,
  getClassesById,
} from '../services/classes.service'
import { z } from 'zod'

// Schema validation
const createClassesSchema = z.object({
  classData: createInsertSchema(classesModel).omit({
    classId: true,
    createdAt: true,
    updatedAt: true,
  }),
  sectionIds: z.array(z.number()).nonempty('At least one section is required'),
})

const editClassesSchema = createClassesSchema.partial()

export const createClassesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //requirePermission(req, 'create_class')
    const { classData, sectionIds } = createClassesSchema.parse(req.body)

    // Call service
    const newClass = await createClasses({
      classData,
      sectionIds,
    })

    res.status(201).json({
      status: 'success',
      data: newClass,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllClassessController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //requirePermission(req, 'view_class')
    const classess = await getAllClasses()

    res.status(200).json(classess)
  } catch (error) {
    next(error)
  }
}

export const getClassesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //requirePermission(req, 'view_class')
    const id = Number(req.params.id)
    const classes = await getClassesById(id)

    res.status(200).json(classes)
  } catch (error) {
    next(error)
  }
}

export const editClassesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //requirePermission(req, 'edit_class')

    const classId = Number(req.params.id)

    // Validate input
    const { classData, sectionIds } = editClassesSchema.parse(req.body)

    // Prepare payload for the service
    if (!classData || !sectionIds) {
      throw new Error('classData and sectionIds are required')
    }
    const payload = {
      classData,
      sectionIds,
    }

    const result = await editClasses(classId, payload)

    res.status(200).json({
      message: 'Class updated successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteClassesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //requirePermission(req, 'delete_class')
    const classId = Number(req.params.id)
    if (!classId) {
      res.status(400).json({ message: 'Invalid class ID' })
    }

    const result = await deleteClassesService(classId)

    res.status(200).json({
      message: 'Class deleted successfully',
      data: result, // { deletedClassId: 1 }
    })
  } catch (error) {
    next(error)
  }
}
