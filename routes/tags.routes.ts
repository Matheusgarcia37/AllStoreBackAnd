import express from 'express';
import TagsController from '../controllers/TagsController';


export const tagRouter = express.Router();


tagRouter.post("/", TagsController.tag);
tagRouter.put("/", TagsController.alter);
tagRouter.get("/", TagsController.index);
tagRouter.delete("/", TagsController.delete);
