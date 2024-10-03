import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"

// dotenv.config(); cho phep ta su dung noi dung ben trong file .env neu khong co no se khong truy cap vao duoc  process.env.PORT
dotenv.config();
connectDB()
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse JSON data in   the req.body
app.use(express.urlencoded({extended :true})); // to parse form data in the req.body
app.use(cookieParser());

//routes
app.use('/api/users/',userRoutes);
app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});