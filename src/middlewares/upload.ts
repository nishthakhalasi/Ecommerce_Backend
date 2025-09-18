import multer from "multer";
import path from "path";

// Store images in 'uploads/' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images are saved
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
});

export default upload;
