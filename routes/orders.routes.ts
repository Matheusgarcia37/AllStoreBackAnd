import express from 'express';
import OrderController from '../controllers/OrderController';


export const orderRouter = express.Router();


orderRouter.post("/", OrderController.order);
orderRouter.get("/:userId", OrderController.getCurrentOrder);
orderRouter.put("/addProduct", OrderController.addProduct);
orderRouter.put("/incrementProducts", OrderController.incrementProducts);
orderRouter.put("/decrementProducts", OrderController.decrementProducts);
orderRouter.put("/finishOrder", OrderController.finishOrder);
orderRouter.put("/removeProduct", OrderController.removeProduct);
