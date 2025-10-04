import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenvx from "@dotenvx/dotenvx";
import productRouter from './Route/product.Route.js';
import cartRouter from './Route/cartRoute.js';
import userRouter from './Route/userRoutes.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import globalErrorHandle from './Controller/errorController.js';
import AppError from './utils/appError.js';
import tagsController from './Controller/tags.Controller.js';

dotenvx.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "https://tmdt-fe-1.onrender.com",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

mongoose.connect(process.env.DB);

app.use("/api/users", userRouter);
app.use('/api/cart', cartRouter);
app.use('/products', productRouter);



// phục vụ file tĩnh
app.use(
  "/img/avatars",
  express.static(path.join(__dirname, "public/img/avatars"))
);

app.get('/alltags', tagsController.getAll);
app.get('/fivetags', tagsController.getFive);

// xử lý 404
app.use((req, res, next) => {
  next(new AppError(`Không tìm thấy ${req.originalUrl} trên server này!`, 404));
});

// xử lý error
app.use(globalErrorHandle.handleError);


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
