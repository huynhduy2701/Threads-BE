// Nhập lớp Server từ thư viện socket.io
import { Server } from "socket.io";
// Nhập mô-đun http từ Node.js
import http from "http";
// Nhập framework express
import express from "express";

// Tạo một instance của ứng dụng Express
const app = express();
// Tạo một HTTP server sử dụng ứng dụng Express
const server = http.createServer(app);
// Tạo một instance mới của Socket.IO server và bật CORS cho nguồn và phương thức được chỉ định
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Cho phép yêu cầu từ nguồn này
    methods: ["GET", "POST"], // Cho phép các phương thức HTTP này
  },
});
export const getRecipientSocketId = (recipientId) =>{
  return userSocketMap[recipientId]; // Trả về socketId của người nhận
}

// Tạo một đối tượng để lưu trữ ánh xạ giữa userId và socketId
const userSocketMap = {}; // userId : socketId

// Lắng nghe sự kiện kết nối và ghi lại ID socket khi người dùng kết nối
io.on("connection", (socket) => {
  console.log("'socket.io' => người dùng kết nối :", socket.id);
  // Lấy userId từ query của socket handshake
  const userId = socket.handshake.query.userId;
  
  if (userId !== "undefined") {
    // Lưu trữ ánh xạ giữa userId và socketId
    userSocketMap[userId] = socket.id;
  }
  // Phát sự kiện getOnlineUsers với danh sách các userId đang trực tuyến
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // [1,2,3,4,5]
  // Lắng nghe sự kiện ngắt kết nối và xóa socketId khỏi userSocketMap
  socket.on("disconnect", () => {
    console.log("'socket.io' => người dùng ngừng kết nối :", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
  });
});

// Xuất các instance io, server và app để sử dụng trong các mô-đun khác
export { io, server, app };
