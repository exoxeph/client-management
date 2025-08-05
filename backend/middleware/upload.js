/**
 * File Upload Middleware
 * This middleware handles file uploads for documents and project attachments
 * Modified to support both disk storage and memory storage for MongoDB
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist (for backward compatibility)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create project attachments directory
const projectAttachmentsDir = path.join(uploadDir, 'project-attachments');
if (!fs.existsSync(projectAttachmentsDir)) {
  fs.mkdirSync(projectAttachmentsDir, { recursive: true });
}

// Configure memory storage for MongoDB
const storage = multer.memoryStorage();

// We'll keep the disk storage for backward compatibility
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create a subdirectory for each document type
    let dir;
    if (file.fieldname === 'businessLicense') {
      dir = path.join(uploadDir, 'business-licenses');
    } else if (file.fieldname === 'taxDocument') {
      dir = path.join(uploadDir, 'tax-documents');
    } else if (file.fieldname === 'attachments') {
      dir = path.join(uploadDir, 'project-attachments');
    } else {
      dir = path.join(uploadDir, 'other');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only pdf, docx, png, jpg, jpeg
  const allowedFileTypes = [
    'application/pdf', 
    'image/png', 
    'image/jpeg', 
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, PNG, JPG and JPEG are allowed.'), false);
  }
};

// Configure multer with memory storage for MongoDB
const upload = multer({
  storage: storage, // Using memory storage
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for project attachments
  }
});

// Configure multer with disk storage for backward compatibility
const diskUpload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for project attachments
  }
});

// Middleware for handling document uploads
const uploadDocuments = upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'taxDocument', maxCount: 1 }
]);

// Middleware for handling project attachments
const uploadProjectAttachments = upload.array('attachments', 5); // Max 5 attachments

// Error handling middleware for multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 5 files.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({ message: err.message });
  }
  // No error occurred, continue
  next();
};

module.exports = { uploadDocuments, uploadProjectAttachments, handleUploadErrors };