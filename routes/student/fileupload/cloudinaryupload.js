const express = require("express");
const router = express.Router();
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../../../cloudinary"); // Ensure this path is correct
require("dotenv").config();

// Debugging: Log Cloudinary config
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY?.slice(0, 4) + "***", // Mask sensitive info
  api_secret: process.env.CLOUDINARY_API_SECRET?.slice(0, 4) + "***",
});

// Configure Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Use the pre-configured Cloudinary instance
  params: (req, file) => ({
    folder: `student_documents/${req.body.student_id}`, // Dynamic folder based on student_id
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // Unique public_id
    resource_type: "auto", // Automatically detect resource type (image, video, etc.)
  }),
});

const upload = multer({ storage });

module.exports = (db) => {
  // POST endpoint for file upload
  router.post(
    "/",
    upload.single("document"),
    asyncHandler(async (req, res) => {
      try {
        // Log incoming request
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file);

        // Validate request
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        const { student_id, remarks } = req.body;

        // Validate required fields
        if (!student_id || !remarks) {
          return res
            .status(400)
            .json({ error: "student_id and remarks are required" });
        }

        // Insert into database
        const result = await db.query(
          "INSERT INTO document (student_id, remarks, uploaded_file) VALUES (?, ?, ?)",
          [student_id, remarks, req.file.secure_url]
        );

        // Respond with success
        res.status(201).json({
          document_id: result.insertId,
          student_id,
          remarks,
          uploaded_file: req.file.secure_url,
          date_uploaded: new Date(),
        });
      } catch (error) {
        console.error("Upload error:", error);
        res
          .status(500)
          .json({ error: "Failed to upload file", details: error.message });
      }
    })
  );

  // GET endpoint to fetch documents
  router.get(
    "/:student_id",
    asyncHandler(async (req, res) => {
      try {
        const { student_id } = req.params;

        // Validate student_id
        if (!student_id) {
          return res.status(400).json({ error: "student_id is required" });
        }

        // Fetch documents from database
        const documents = await db.query(
          "SELECT * FROM document WHERE student_id = ?",
          [student_id]
        );

        // Respond with documents
        res.json(documents);
      } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Failed to fetch documents" });
      }
    })
  );

  return router;
};
