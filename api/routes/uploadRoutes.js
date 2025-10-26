import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import Tesseract from "tesseract.js";
import { pdfToPng } from "pdf-to-png-converter"; 

const router = express.Router();

const licensesDir = "uploads/licenses";

fs.mkdirSync(licensesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, licensesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "license-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: File upload only supports PDF, JPG, or PNG formats."));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// --- HEAVILY UPDATED UPLOAD ENDPOINT ---
router.post("/license", upload.single("license"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded." });
  }

  const pdfFilePath = req.file.path;
  let pngFilePath = ""; 

  try {
    console.log(`[CONVERT] Converting PDF: ${pdfFilePath}`);

    const pngPages = await pdfToPng(pdfFilePath, {
      outputFolder: licensesDir,
      outputPrefix: path.basename(pdfFilePath, ".pdf"),
      pages: [1], // Only convert the first page
    });

    pngFilePath = pngPages[0].path;
    console.log(`[CONVERT] Converted to: ${pngFilePath}`);

    await fsp.unlink(pdfFilePath);
    console.log(`[CLEANUP] Deleted original PDF: ${pdfFilePath}`);

    console.log(`[OCR] Starting OCR for PNG: ${pngFilePath}...`);
    const { data: { text } } = await Tesseract.recognize(pngFilePath, "eng", {
      logger: (m) => console.log(m.status),
    });

    console.log(`[OCR] Text extracted from PNG.`);

    const licenseRegex = /\b(HN|CN)[\s-]?([A-Za-z0-9]+)\b/;
    const licenseMatch = text.match(licenseRegex);

    if (!licenseMatch) {
      console.log(
        `[OCR] Validation FAILED for ${pngFilePath}. No HN/CN license found.`
      );
      await fsp.unlink(pngFilePath); 
      return res.status(400).json({
        message:
          "Invalid Document: A valid license number (starting with HN or CN) could not be found.",
      });
    }

    console.log(
      `[OCR] Validation SUCCESS for ${pngFilePath}. Found: ${licenseMatch[0]}`
    );
    
    res.status(200).json({
      message: "License uploaded successfully.",
      path: pngFilePath, 
    });

  } catch (error) {
    console.error("File upload or OCR error:", error);

    try {
      await fsp.unlink(pdfFilePath);
      console.log(`[ERROR CLEANUP] Deleted PDF: ${pdfFilePath}`);
    } catch (e) {  }
    
    try {
      if (pngFilePath) {
        await fsp.unlink(pngFilePath);
        console.log(`[ERROR CLEANUP] Deleted PNG: ${pngFilePath}`);
      }
    } catch (e) {}

    res.status(500).json({ message: error.message || "Error during file processing." });
  }
});

export default router;