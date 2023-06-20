import jwt from "jsonwebtoken";

//NOTE: sign() => is for generating the token for a user
//      verify() => is for verifying the token for a user or token bearer
const genToken = (res, userId) => {
  //sign(payload, secret_srting, object)
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token, {
    path: "/", // default to / if not specify
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 1000,
  });
};

export default genToken;
