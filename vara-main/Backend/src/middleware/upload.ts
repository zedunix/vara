import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure multer for memory storage (we'll upload to Supabase)
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Portfolio PDF
  if (file.fieldname === 'portfolio') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for portfolio'));
    }
  }
  // Image gallery ZIP
  else if (file.fieldname === 'images') {
    const allowedMimes = ['application/zip', 'application/x-zip-compressed'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed for image gallery'));
    }
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 52428800, // 50MB max
  },
});

export const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 },
  { name: 'images', maxCount: 1 },
]);
