import express from 'express';
import cors from 'cors';
import path from 'path';
import { storeRouter } from './routes/store.routes';
import { tagRouter } from './routes/tags.routes';
import { productsRouter } from './routes/products.routes';
import { orderRouter } from './routes/orders.routes';
import userRouter from './routes/user.routes';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/files', express.static(path.resolve(__dirname, 'tmp', 'uploads')));
app.use(cors());

app.use('/store', storeRouter);
app.use('/user', userRouter);
app.use('/tags', tagRouter);
app.use('/products', productsRouter);
app.use('/order', orderRouter);

const port = 3001;

app.listen(port, () => console.log(`Servidor rodando em ${port}!`));