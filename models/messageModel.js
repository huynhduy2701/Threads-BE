import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
  {
    // mongoose.Schema.Types.ObjectId: Đây là kiểu dữ liệu đặc biệt của MongoDB để lưu trữ một ObjectId (một ID duy nhất được MongoDB tự động tạo ra).

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);
export default Message;