import { Router } from "express";
import { getUserProfile } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/profile", getUserProfile);

export default userRouter;
