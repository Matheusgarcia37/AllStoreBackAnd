import express from 'express';
import ProductsController from '../controllers/ProductsController';


export const productsRouter = express.Router();


productsRouter.post("/", ProductsController.product);
productsRouter.put("/:id", ProductsController.alter);
productsRouter.get("/:id", ProductsController.getBydId);
productsRouter.get("/", ProductsController.index);
productsRouter.delete("/:id", ProductsController.delete);
