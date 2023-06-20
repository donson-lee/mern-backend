import asyncHandler from "express-async-handler";
import UserModel from "../models/userModel.js";
import genToken from "../utils/generateToken.js";

/*REGISTER USER CTRL/FUNCTION STARTS HERE.*/
const registerUser = asyncHandler(async (req, res) => {
  let { firstName, lastName, email, password, confirmPassword } = req.body;

  firstName = firstName.trim();
  lastName = lastName.trim();
  password = password.trim();
  email = email.trim();

  if (!firstName && !lastName && !email && !password && !confirmPassword) {
    res.status(400);
    throw new Error("Please fill out all required fields.");
  }
  //email validate : using RFC 5322 format
  let emailRegEx = /^W+([\.-]?\W+)@\W+([\.-]?\W+)*(\.\W{2,3})+$/;
  if (!emailRegEx.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address.");
  }
  //password regular expression
  let passwordRegEx = "some password regex string here.";
  if (!passwordRegEx.test(password)) {
    res.status(400);
    throw new Error("Password cant contain special characters.");
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error(
      "Passwords dont match. Please enter correct confirm password."
    );
  }

  const userExist = await UserModel.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("Sorry, the user already exist.");
  }
  const newUser = await UserModel.create({
    firstName,
    lastName,
    email,
    password,
  });

  if (!newUser) {
    res.status(400);
    throw new Error("Failed to create new account. Please try again later.");
  } else {
    genToken(res, newUser._id);
    const { password, ...others } = newUser;
    res.status(201).json(others);
  }
});
/*REGISTER USER CTRL/FUNCTION ENDS HERE.*/

/*LOGIN USER CTRL/FUNCTION STARTS HERE.*/
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    res.status(400);
    throw new Error("Please enter email and password.");
  }
  if (!email) {
    res.status(400);
    throw new Error("Please enter email.");
  }
  if (!password) {
    res.status(400);
    throw new Error("Please enter password.");
  }

  const user = UserModel.findOne({ email });
  const validPassword = await user.matchPassword(password);
  //(await user.matchPassword(password))

  if (user && validPassword) {
    genToken(res, user._id);
    const { password, ...others } = user;
    res.status(200).json(others);
  } else {
    res.status(401);
    throw new Error("Invalid email or password.");
  }
});
/*LOGIN USER CTRL/FUNCTION ENDS HERE.*/

/*LOG OUT USER CTRL/FUNCTION STARTS HERE.*/
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
  });
  return res.status(200).json({ message: "User logged out successfully." });
});
/*LOG OUT USER CTRL/FUNCTION ENDS HERE.*/

export { registerUser, loginUser, logoutUser };
