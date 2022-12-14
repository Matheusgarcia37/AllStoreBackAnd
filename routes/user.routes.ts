import { Router } from "express";
import UserController from "../controllers/UserController";
import AuthController from "../controllers/AuthController";
import authMiddleware from "../middlewares/authMiddleware";
import multer from 'multer';
import multerConfig from '../config/multer';

const userRouter = Router();

//create user
userRouter.post("/", UserController.store);
userRouter.put("/", UserController.alter);
userRouter.put("/alterUserClient", UserController.alterUserClient);
userRouter.post("/auth", AuthController.authenticate);
userRouter.post("/authClient", AuthController.authenticateClient);
userRouter.post("/getUserByToken", AuthController.getUserByToken);
userRouter.post("/getUserById", UserController.getUserById);
userRouter.post("/getUserClientById", UserController.getUserClientById);
userRouter.post("/getCustomersFromStore", UserController.getCustomersFromStore);
userRouter.get("/:storeId", authMiddleware, UserController.index);
userRouter.delete("/:id", authMiddleware, UserController.delete);
userRouter.put("/changeImageProfile/:id", authMiddleware, multer(multerConfig).single('file'), UserController.changeImageProfile);
userRouter.post("/storeUserClient", UserController.storeUserClient);


export default userRouter;