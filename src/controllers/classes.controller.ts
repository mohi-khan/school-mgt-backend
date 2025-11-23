import { NextFunction, Request, Response } from 'express'
import { createInsertSchema } from 'drizzle-zod'
import { classesModel } from '../schemas'
import { requirePermission } from '../services/utils/jwt.utils'
import {
  createClasses,
  editClasses,
  getAllClassess,
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
  sectionIds: z.array(z.number()).nonempty("At least one section is required"),
});


const editClassesSchema = createClassesSchema.partial()

export const createClassesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate incoming data
    const { classData, sectionIds } = createClassesSchema.parse(req.body);

    // Call service
    const newClass = await createClasses({
      classData,
      sectionIds,
    });

    res.status(201).json({
      status: 'success',
      data: newClass,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllClassessController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // requirePermission(req, 'view_account_head')
    const classess = await getAllClassess()

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
    requirePermission(req, 'view_account_head')
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
    requirePermission(req, 'edit_account_head')
    const id = Number(req.params.id)
    const classesData = editClassesSchema.parse(req.body)
    const classes = await editClasses(id, classesData)

    res.status(200).json(classes)
  } catch (error) {
    next(error)
  }
}
