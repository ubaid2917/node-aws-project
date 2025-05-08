// utils/multer.js
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
require('dotenv').config();

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY ,
  region: process.env.BUCKET_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME, 
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = Date.now().toString() + '-' + file.originalname;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { upload };
