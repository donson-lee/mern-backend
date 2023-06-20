import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.log("Error: Unable to connect to MongoDB.");
  }
};

export default connectDB;
