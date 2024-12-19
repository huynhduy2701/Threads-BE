import jwt from "jsonwebtoken";
const generateTokenAndCookie = (userId, res) => {
  // jwt.sign Phương thức này tạo một token dựa trên payload (ở đây là userId).
  // Payload { userId } Đây là dữ liệu mà bạn mã hóa trong JWT, tức là userId của người dùng
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h", //Token sẽ hết hạn sau 1 ngày.
  });
  res.cookie("jwt", token, {
    httpOnly: true, // more secure ,Cookie chỉ có thể được truy cập thông qua HTTP(S), giúp ngăn ngừa tấn công XSS (cross-site scripting).
    maxAge: 1 * 24 * 60 * 60 * 1000,
    sameSite: "strict", //Cookie sẽ không được gửi cùng với các yêu cầu chéo miền (cross-site request), giúp tăng tính bảo mật.
  });

  return token;
};

export default generateTokenAndCookie;
// //15days×24hours/day×60minutes/hour×60seconds/minute×1000milliseconds/second
// =
// 15
// ×
// 24
// ×
// 60
// ×
// 60
// ×
// 1000
// =
// 1
// ,
// 296
// ,
// 000
// ,
// 000
//
// milliseconds
// =15×24×60×60×1000=1,296,000,000milliseconds
