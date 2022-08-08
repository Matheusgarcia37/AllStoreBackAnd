import { Router } from "express";
import UserController from "../controllers/UserController";
import AuthController from "../controllers/AuthController";
import authMiddleware from "../middlewares/authMiddleware";
const userRouter = Router();

//create user
userRouter.post("/", UserController.store);
userRouter.put("/", UserController.alter);
userRouter.post("/auth", AuthController.authenticate);
userRouter.post("/getUserByToken", AuthController.getUserByToken);
userRouter.post("/getUserById", UserController.getUserById);
userRouter.get("/", authMiddleware, UserController.index);
userRouter.delete("/", authMiddleware, UserController.delete);


export default userRouter;