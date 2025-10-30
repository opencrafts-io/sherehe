import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// ✅ Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// ✅ Multer middleware setup
const upload = multer({ storage: storage });

// ✅ Helper to process & save resized images
export const processAndSaveImages = async (req) => {
  const uploadDir = "uploads/";

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const resizedPaths = {};

  // List of expected fields and their resize dimensions
  const resizeSettings = {
    event_card_image: { width: 1000, height: 1000 },
    event_banner_image: { width: 1600, height: 900 },
    event_poster_image: { width: 1000, height: 1500 },
  };

  for (const fieldName of Object.keys(resizeSettings)) {
    const file = req.files?.[fieldName]?.[0];
    if (file) {
      const { width, height } = resizeSettings[fieldName];
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${fieldName}${ext}`;
      const filepath = path.join(uploadDir, filename);

      // ✅ Resize directly from memory, no original saved
      await sharp(file.buffer)
        .resize(width, height, { fit: "cover" })
        .toFile(filepath);

      resizedPaths[fieldName] = filepath;
    }
  }

  return resizedPaths;
};

export default upload;
