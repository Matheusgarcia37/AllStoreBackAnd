import express from 'express';
import ProductsController from '../controllers/ProductsController';


export const productsRouter = express.Router();


productsRouter.post("/", ProductsController.product);
productsRouter.put("/", ProductsController.alter);
productsRouter.get("/", ProductsController.index);
productsRouter.delete("/:id", ProductsController.delete);
