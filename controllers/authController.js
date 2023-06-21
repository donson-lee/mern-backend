import asyncHandler from "express-async-handler";
import UserModel from "../models/userModel.js";
import genToken from "../utils/generateToken.js";
import TokenModel from "../models/tokenModel.js";
import crypto from "node:crypto";
import sendEmail from "../utils/sendEmail.js";

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

/*CHANGE PASSWORD CTRL/FUNCTION STARTS HERE.*/
const changePassword = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  } else {
    const { oldPassword, password } = req.body;
    if (!oldPassword && !password) {
      res.status(400);
      throw new Error("Please enter old and new passwords to continue.");
    }
    if (!oldPassword) {
      res.status(400);
      throw new Error("Please enter old password before changing it");
    }
    if (!password) {
      res.status(400);
      throw new Error("Please enter your new password ..");
    }
    const validPassword = await user.matchPassword(oldPassword);

    if (!user && !validPassword) {
      res.status(400);
      throw new Error(
        "Password not matched. Check to confirm your old password."
      );
    } else {
      user.password = password;
      await user.save();
      res.status(200).json({ message: "Password changed successfully." });
    }
  }
});
/*CHANGE PASSWORD CTRL/FUNCTION ENDS HERE.*/

/*FORGOT PASSWORD CTRL/FUNCTION STARTS HERE.*/
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  //delete previous token if exist
  let tokenExist = await TokenModel.findOne(user._id);
  if (tokenExist) {
    await tokenExist.deleteOne();
  }
  //create reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

  //hash the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //save the token to the BD
  const token = await new TokenModel({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // 30 mins
  });
  token.save();

  //construct reset url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${hashedToken}`;

  //email message
  const message = `
  <h1>Hello,${user.firstName}</h1>
  <p>You have requested for password reset.</p>
  <p>Please use the url linked below to reset your password.</p>
  <p>This url link is valid for only 30 minutes.</p>
  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  
  <p>Best regards...</p>
  <p>Niugini Market Team</p>
  `;
  const subject = "Password Reset Request";
  const mail_to = user.email;
  const mail_from = process.env.EMAIL_USER;
  const noReply = `<p>Sender does not support replies.</p>`;

  try {
    await sendEmail(subject, message, mail_to, mail_from, noReply);
    res.status(200).json({ success: true, message: "Reset email sent." });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again later.");
  }
});
/*FORGOT PASSWORD CTRL/FUNCTION ENDS HERE.*/

/*RESET PASSWORD CTRL/FUNCTION STARTS HERE.*/
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  //hash token, then compare token in db
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //find token in db
  const userToken = await TokenModel.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or expired token");
  }

  const user = await UserModel.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password reset success. Please use this password to login.",
  });
});
/*RESET PASSWORD CTRL/FUNCTION ENDS HERE.*/

export {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
