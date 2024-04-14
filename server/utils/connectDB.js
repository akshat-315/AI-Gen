const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb://AI-Gen1:aigen123@ac-7ubvdt6-shard-00-00.1glrpm3.mongodb.net:27017,ac-7ubvdt6-shard-00-01.1glrpm3.mongodb.net:27017,ac-7ubvdt6-shard-00-02.1glrpm3.mongodb.net:27017/ai-gen?ssl=true&replicaSet=atlas-aeivbg-shard-0&authSource=admin&retryWrites=true&w=majority"
    );
    console.log(`MongoDB connected ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error connecting to MongoDB ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
