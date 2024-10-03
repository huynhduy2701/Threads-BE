import User from "../models/userModel.js";
import jwt from "jsonwebtoken"; // Thêm import cho jwt

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt; // Lấy token từ cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET); 
    const user = await User.findById(decode.userId).select("-password");

    req.user = user; // Lưu thông tin người dùng vào req.user
    next(); // Tiếp tục với middleware tiếp theo
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in protectRoute:", error.message);
  }
};

export default protectRoute;
