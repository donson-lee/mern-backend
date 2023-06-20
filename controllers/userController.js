import UserModel from "../models/userModel.js";
import asyncHandler from "express-async-handler";

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await UserModel.findById(userId);

  if (user) {
    const { password, ...others } = user;
    res.status(200).json(others);
  } else {
    res.status(400);
    throw new Error("No such user data");
  }
});

export { getUserProfile };
