import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
        console.log('Created uploads directory with full permissions');
      } else {
        fs.chmodSync(uploadDir, 0o777);
      }
    } catch (error) {
      console.error('Error setting up uploads directory:', error.message);
      return cb(error);
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); 
  }
});

const upload = multer({ storage: storage });

export default upload; 
