import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

//GLOBAL MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

//Database connection
const dbConn = async () => {
  try {
    connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

dbConn();

//ROUTING
app.use("/api/users", authRouter);
app.use("/api/users", userRouter);
app.use(errorHandler);
