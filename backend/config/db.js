const dns = require('dns');
const mongoose = require('mongoose');

const wait = (milliseconds) => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured in the backend .env file');
  }

  // Some Windows DNS providers refuse MongoDB Atlas SRV lookups.
  dns.setServers(['1.1.1.1', '8.8.8.8']);

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        console.warn(`MongoDB connection attempt ${attempt} failed. Retrying...`);
        await wait(3000);
      }
    }
  }

  throw new Error(`MongoDB Connection Error: ${lastError.message}`);
};

module.exports = connectDB;
