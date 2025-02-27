const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CLOUD_URI, {});
    console.log({
      message: `MongoDB connected: ${mongoose.connection.host}`,
    });
  } catch (error) {
    console.error({
      message: `Error: ${error.message}`,
    });
    process.exit(1);
  }
};

module.exports = { connectDB };
// This code connects to the database using Mongoose, which is a MongoDB object modeling tool designed to work in an asynchronous environment. The connectDB function uses async/await to connect to the database. It uses the MONGO_URI environment variable to connect to the local MongoDB database, and the MONGO_URI_CLOUD environment variable to connect to the MongoDB Atlas cloud database.

// The connectDB function is then exported so it can be used in other parts of the application to establish a connection to the database.

// This code can be added to the config/db.js file, which can be required in the app.js file to establish a connection to the database when the application starts.
