import { Request, Response } from 'express'
import { createStudent, getAllStudents, getStudentById } from '../services/students.service'
import { requirePermission } from '../services/utils/jwt.utils'

export const createStudentController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'create_student')
    console.log("📥 Received files:", req.files)
    console.log("📥 Received body:", req.body)

    // Parse the JSON strings from FormData
    const studentDetails = JSON.parse(req.body.studentDetails)
    const studentFees = JSON.parse(req.body.studentFees)

    console.log("🧾 Parsed studentDetails:", studentDetails)
    console.log("💰 Parsed studentFees:", studentFees)

    if (!studentDetails || !studentFees) {
      res.status(400).json({
        error: "Student data is required",
        receivedFields: Object.keys(req.body),
      })
    }

    // Handle file uploads and update photo URLs with full path
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`
    
    if (files?.photoUrl?.[0]) {
      studentDetails.photoUrl = `${baseUrl}${files.photoUrl[0].filename}`
      console.log(`✅ Student photo URL: ${studentDetails.photoUrl}`)
    }
    if (files?.fatherPhotoUrl?.[0]) {
      studentDetails.fatherPhotoUrl = `${baseUrl}${files.fatherPhotoUrl[0].filename}`
      console.log(`✅ Father photo URL: ${studentDetails.fatherPhotoUrl}`)
    }
    if (files?.motherPhotoUrl?.[0]) {
      studentDetails.motherPhotoUrl = `${baseUrl}${files.motherPhotoUrl[0].filename}`
      console.log(`✅ Mother photo URL: ${studentDetails.motherPhotoUrl}`)
    }

    const data = {
      studentDetails,
      studentFees
    }

    const createdStudent = await createStudent(data)

    res.json({ success: true, data: createdStudent })
  } catch (err) {
    console.error("❌ Student creation error:", err)
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" })
    }
  }
}

export const getAllStudentsController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_student');
    const data = await getAllStudents();
    res.json(data);
  } catch (error) {
    console.error("Get All Students Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getStudentByIdController = async (req: Request, res: Response) => {
  try {
    requirePermission(req, 'view_student');
    const studentId = Number(req.params.id);
    const data = await getStudentById(studentId);

    if (!data)
      res.status(404).json({ success: false, message: "Student not found" });

    res.json(data);
  } catch (error) {
    console.error("Get Student By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};