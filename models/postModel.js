import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId, //cho phép bạn lưu trữ một ObjectId và có thể được dùng để tạo liên kết giữa các tài liệu ở các bộ sưu tập khác nhau.
      ref: "User", //ghĩa là trường này tham chiếu tới mô hình User, cho phép bạn thực hiện populate để lấy thông tin về người dùng.
      required: true,
    },
    text: {
      type: String,
      maxLength: 500,
    },
    img: {
      type: String,
    },
    likes: {
      // type: Number,
      // default: 0,
      type:[mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        userProfilePic: {
          type: String,
        },
        username: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Post = mongoose.model("Post", postSchema);
export default Post;