import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import UserModel from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login.");
    }
    //returns a user object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(400);
      throw new Error("Sorry, user not found.");
    }
    //store all info to the req.user which is the current logged in user.
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, no token or invalid token.");
  }
});

export default protect;
