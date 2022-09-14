import express from 'express';
import ProductsController from '../controllers/ProductsController';
import multer from 'multer';
import multerConfig from '../config/multer';


export const productsRouter = express.Router();


productsRouter.post("/", multer(multerConfig).array('file') ,ProductsController.product);
productsRouter.put("/featured", ProductsController.getFeaturedProducts);
productsRouter.put("/:id", multer(multerConfig).array('file'), ProductsController.alter);
productsRouter.get("/:id", ProductsController.getBydId);
productsRouter.put("/", ProductsController.index);
productsRouter.delete("/:id", ProductsController.delete);
