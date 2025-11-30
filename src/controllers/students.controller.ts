import { Request, Response } from 'express'
import { createStudent } from '../services/students.service'

// student.controller.ts
// student.controller.ts
export const createStudentController = async (req: Request, res: Response) => {
  try {
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