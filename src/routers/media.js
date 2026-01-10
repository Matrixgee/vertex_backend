const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config({ override: true });

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Allowed MIME types and file size limit
const allowedMimeTypes = ["image/jpeg", "image/png"];
const maxFileSize = 10 * 1024 * 1024; // 5MB

// Multer upload manager
const uploadManager = (destination) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: `Blockinv/${destination}`,
        resource_type: "image",
        format: "jpg",
      };
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxFileSize }, // Set file size limit
    fileFilter: (req, file, cb) => {
      if (!file) {
        return cb(new Error("No file uploaded."));
      }
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
          new Error("Invalid file type. Only JPEG and PNG are allowed.")
        );
      }
      cb(null, true);
    },
  });
};

const upload = uploadManager("uploads");

/**
 * @swagger
 * /media/upload-single:
 *   post:
 *     summary: Upload a single image
 *     description: Uploads one image and returns its URL.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 mediaUrl:
 *                   type: string
 *       400:
 *         description: Bad request (e.g., no file uploaded, invalid file type, or file too large).
 *       500:
 *         description: Internal Server Error.
 */
router.post("/upload-single", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Image uploaded successfully.",
      mediaUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to upload image.",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /media/upload-multiple:
 *   post:
 *     summary: Upload multiple images
 *     description: Uploads up to three images and returns their URLs.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 mediaUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request (e.g., no files uploaded, invalid file types, or files too large).
 *       500:
 *         description: Internal Server Error.
 */
router.post("/upload-multiple", upload.array("files", 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No files uploaded.",
      });
    }

    const mediaUrls = req.files.map((file) => file.path);

    res.status(200).json({
      status: "success",
      message: "Images uploaded successfully.",
      mediaUrls,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to upload images.",
      error: error.message,
    });
  }
});

module.exports = router;
