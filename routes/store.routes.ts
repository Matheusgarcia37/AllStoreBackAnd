import express from 'express';
import { StoreController } from '../controllers/store.controller';


export const storeRouter = express.Router();
const storeController = new StoreController();


storeRouter.get('/', (req, res) => {
    storeController.index(req, res);
});
storeRouter.post('/', (req, res) => {
    storeController.create(req, res);
});