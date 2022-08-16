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

storeRouter.get('/:NameStore', (req, res) => {
    storeController.show(req, res);
});

storeRouter.get('/getById/:id', (req, res) => {
    storeController.getById(req, res);
});

storeRouter.put('/:id', (req, res) => {
    storeController.update(req, res);
});