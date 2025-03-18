// mongodb-vercel-config.js
// This script updates MongoDB configuration for Vercel deployment
// Usage: node mongodb-vercel-config.js

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating MongoDB configuration for Vercel...');

// Define project directories
const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'server');
const CONFIG_DIR = path.join(BACKEND_DIR, 'config');

// Update db.js for Vercel
const dbJsPath = path.join(CONFIG_DIR, 'db.js');

if (fs.existsSync(dbJsPath)) {
  try {
    console.log(`Updating MongoDB connection in ${dbJsPath}...`);
    
    const dbJsContent = fs.readFileSync(dbJsPath, 'utf8');
    
    // Create updated db.js content with better error handling and options for Vercel
    const updatedDbJsContent = `const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // These options are recommended for Vercel serverless environment
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB connected');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;
`;

    fs.writeFileSync(dbJsPath, updatedDbJsContent);
    console.log(`✅ Updated ${dbJsPath} for Vercel compatibility`);
  } catch (error) {
    console.error(`❌ Error updating ${dbJsPath}:`, error.message);
  }
} else {
  console.log(`❌ File not found: ${dbJsPath}`);
}

// Update multerOfConfig.js for Vercel
const multerConfigPath = path.join(CONFIG_DIR, 'multerOfConfig.js');

if (fs.existsSync(multerConfigPath)) {
  try {
    console.log(`Updating GridFS configuration in ${multerConfigPath}...`);
    
    const multerConfigContent = fs.readFileSync(multerConfigPath, 'utf8');
    
    // Create updated multerOfConfig.js content for Vercel serverless environment
    const updatedMulterConfigContent = `const multer = require("multer");
const { MongoClient, GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Use OS temp directory for Vercel compatibility
const TEMP_DIR = os.tmpdir();

async function connectDB() {
  const MONGODB_URI = process.env.MONGO_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }
  
  try {
    const client = await MongoClient.connect(MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("Connected to MongoDB for GridFS");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Use cached pattern for Vercel serverless environment
let cached = { bucket: null, client: null, promise: null };

async function getBucket() {
  if (cached.bucket) {
    return cached.bucket;
  }
  
  if (!cached.promise) {
    cached.promise = connectDB().then(client => {
      cached.client = client;
      const db = client.db("mongodb_gridfs");
      cached.bucket = new GridFSBucket(db, { bucketName: "myBucketName" });
      console.log("GridFS Bucket initialized");
      return cached.bucket;
    });
  }
  
  try {
    cached.bucket = await cached.promise;
    return cached.bucket;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use OS temp directory for Vercel
    const uploadPath = path.join(TEMP_DIR, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ✅ Upload Middleware for Two Files
const upload = multer({
  storage,
}).fields([
  { name: "scriptFile", maxCount: 1 },
  { name: "supportFile", maxCount: 1 },
]);

// ✅ Upload Files to GridFS with Metadata
const uploadToGridFS = async (req, res, next) => {
  if (!req.files || (!req.files.scriptFile && !req.files.supportFile)) {
    return res.status(400).json({ error: "At least one file is required." });
  }

  try {
    const bucket = await getBucket();
    
    const uploadFileToGridFS = (file, fileTypeName) => {
      return new Promise((resolve, reject) => {
        const filePath = file.path;
        const fileName = file.filename;

        const stream = fs.createReadStream(filePath)
          .pipe(
            bucket.openUploadStream(fileName, {
              chunkSizeBytes: 1048576, // 1 MB
              metadata: {
                name: Date.now() + "-" + file.originalname,
                size: file.size,
                type: file.mimetype,
                fileTypeName: fileTypeName,
              },
            })
          );

        stream.on("finish", () => {
          // Delete local file after upload
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn("Could not delete temp file:", err);
          }
          resolve(stream.id);
        });

        stream.on("error", (err) => {
          console.error("GridFS Upload Error:", err);
          reject(err);
        });
      });
    };

    const uploadedFiles = [];

    if (req.files.scriptFile) {
      const scriptFile = req.files.scriptFile[0];
      const scriptFileName = await uploadFileToGridFS(scriptFile, "scriptFile");
      uploadedFiles.push({ scriptFile: scriptFileName });
    }

    if (req.files.supportFile) {
      const supportFile = req.files.supportFile[0];
      const supportFileName = await uploadFileToGridFS(supportFile, "supportFile");
      uploadedFiles.push({ supportFile: supportFileName });
    }

    req.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    console.error("Error uploading files:", error);
    next(error);
  }
};

const getFileFromGridFS = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = await getBucket();

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", (err) => {
      console.error("Download error:", err);
      res.status(404).json({ message: "File not found" });
    });

    res.set("Content-Type", "application/octet-stream");
    res.set("Content-Disposition", \`attachment; filename="file-\${fileId}"\`);
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteFileFromGridFS = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ error: "File ID is required" });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = await getBucket();

    try {
      await bucket.delete(fileId);
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: "File not found or already deleted" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

module.exports = { upload, uploadToGridFS, getFileFromGridFS, deleteFileFromGridFS };
`;

    fs.writeFileSync(multerConfigPath, updatedMulterConfigContent);
    console.log(`✅ Updated ${multerConfigPath} for Vercel compatibility`);
  } catch (error) {
    console.error(`❌ Error updating ${multerConfigPath}:`, error.message);
  }
} else {
  console.log(`❌ File not found: ${multerConfigPath}`);
}

console.log('\n✅ MongoDB configuration updated for Vercel!');
