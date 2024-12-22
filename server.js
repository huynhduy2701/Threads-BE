import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js";
import {v2 as cloudinary} from "cloudinary";
import cors from "cors";
// dotenv.config(); cho phep ta su dung noi dung ben trong file .env neu khong co no se khong truy cap vao duoc  process.env.PORT
dotenv.config();
connectDB();
const app = express();

// const PORT = process.env.PORT || 5000; 
const PORT = process.env.PORT; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
app.use(
  cors({
    origin: "https://threads-fe-3p1b.vercel.app", // Thay bằng URL frontend trên Vercel
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức được phép
    credentials: true, // Nếu cần gửi cookie hoặc thông tin xác thực
  })
);
app.use(express.json({limit:"50mb"})); // to parse JSON data in   the req.body chúng ta giới hạn ảnh gởi lên server
app.use(express.urlencoded({extended :true})); // to parse form data in the req.body
app.use(cookieParser());

//routes
app.use('/api/users/',userRoutes);
app.use("/api/post/", postRoutes);

//test
// app.get('/login', (req, res) => {

//   res.send('login success');
// })

app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});