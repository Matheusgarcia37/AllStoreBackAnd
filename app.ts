import express from 'express';
import cors from 'cors';
import { storeRouter } from './routes/store.routes';
import userRouter from './routes/user.routes';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/store', storeRouter);
app.use('/user', userRouter);

const port = 3001;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));