const multer = require("multer");

const fs = require("fs");
const path = require("path");

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    // SECURITY: Use a random name to prevent directory traversal and file overwrite
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for production
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // SECURITY: Limit allowed file types
    const allowedTypes = ['application/pdf', 'video/mp4', 'video/mpeg', 'video/quicktime', 'application/octet-stream'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Video files are allowed.'));
    }
  }
});

module.exports = upload;
