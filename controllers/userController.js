import UserModel from "../models/userModel.js";
import asyncHandler from "express-async-handler";

//get specific user profile
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

//update user information
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = UserModel.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  } else {
    const { firstName, lastName, image, email } = user;
    user.email = email;
    user.firstName = req.body.firstName || firstName;
    user.lastName = req.body.lastName || lastName;
    user.image = req.body.image || image;

    const updatedUser = await user.save();
    const { pasword, ...others } = updatedUser;
    res.status(200).json(others);
  }
});

export { getUserProfile, updateUser };
