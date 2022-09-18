import express from 'express';
import OrderController from '../controllers/OrderController';


export const orderRouter = express.Router();


orderRouter.post("/", OrderController.order);
orderRouter.get("/:userId", OrderController.getCurrentOrder);
orderRouter.put("/addProduct", OrderController.addProduct);
