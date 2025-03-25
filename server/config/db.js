// server/config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGO_URI environment variable is not defined!");
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env'
  );
}

console.log(`MongoDB URI (first 20 chars): ${MONGODB_URI.substring(0, 20)}...`);

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and across function calls in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
  console.log("Initializing new MongoDB connection cache");
} else {
  console.log("Using existing MongoDB connection cache");
}

const connectDB = async () => {
  console.log("connectDB called");
  
  if (cached.conn) {
    console.log('✅ Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new MongoDB connection promise");
    
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log("MongoDB connection options:", opts);

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('✅ MongoDB connected successfully');
        console.log(`Connected to database: ${mongoose.connection.name}`);
        console.log(`Connection state: ${mongoose.connection.readyState}`);
        return mongoose;
      })
      .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null;
        throw err;
      });
  } else {
    console.log("Using existing MongoDB connection promise");
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error("❌ Error resolving MongoDB connection promise:", e);
    cached.promise = null;
    throw e;
  }
};

module.exports = connectDB;