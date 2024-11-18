import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import {v2 as cloudinary} from "cloudinary"
//createPost
const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let {img} = req.body;

    if (!postedBy || !text) {
      return res.status(400).json({ error: "Vui lòng điền đủ thông tin" });
    }

    const user = await User.findById(postedBy);

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy user" });
    }
    if (user._id.toString() !== req.user.id.toString()) {
      return res
        .status(401)
        .json({ error: "Bạn không có quyền truy cập đăng bài" });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res.status(400).json({
        error: `Nội dung bài đăng không được quá ${maxLength} ký tự`,
      });
    }

    if (img) {
         const uploadedResponse = await cloudinary.uploader.upload(img);
         img = uploadedResponse.secure_url
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    res.status(201).json({ message: "Tạo bài viết thành công", newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in createPost :  ", error.message);
  }
};

//getPost
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log("getPost : ", post);

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in getPost :", error.message);
  }
};

//deletePost
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log("deletePost", deletePost);
    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(404)
        .json({ error: "Bạn không có quyền truy cập để xóa bài viết" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa bài viết thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in deletePost : ", error.message);
  }
};

//likePost

const likePost = async (req, res) => {
  try {
    // Lấy ID của bài viết từ tham số URL (req.params). Ví dụ: nếu bạn có URL /api/posts/like/12345, thì postId sẽ là 12345.
    const { id: postId } = req.params;
    //  Lấy ID của người dùng hiện tại từ req.user._id. Đây là người dùng đang đăng nhập và muốn thích hoặc bỏ thích bài viết
    const userId = req.user._id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
    // Đây là mảng lưu trữ các ID người dùng đã thích bài viết. Sử dụng includes để kiểm tra xem userId (ID của người dùng hiện tại) có nằm trong danh sách những người đã thích bài viết hay chưa.
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      //xóa like bài viết
      // $pull: Đây là toán tử của MongoDB để xóa một phần tử khỏi mảng. Ở đây, bạn xóa userId khỏi mảng likes của bài viết.
      //  cập nhật bài viết bằng cách xóa userId ra khỏi danh sách những người thích bài viết.
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Hủy like bài viết thành công" });
    } else {
      //like bài viết
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Like bài viết thành công" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in likePost : ", error.message);
  }
};

//replyPost
const replyPost = async (req, res) => {
  try {
    const { text } = req.body; //Nội dung phản hồi, được gửi trong req.body
    const postId = req.params.id; //ID của bài viết mà người dùng muốn trả lời, được lấy từ tham số URL req.params.id
    const userId = req.user._id; // ID của người dùng đang đăng nhập, lấy từ req.user._id (giả sử req.user đã có sau khi xác thực).
    const userProfilePic = req.user.profilePic; //Hình đại diện của người dùng, lấy từ req.user.profilePic
    const username = req.user.username; //Tên người dùng, lấy từ req.user.username

    if (!text) {
      return res
        .status(400)
        .json({ error: "Vui lòng nhập nội dung để trả lời bài viết" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();
    res.status(201).json({ message: "Trả lời bài viết thành công", reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in replyPost : ", error.message);
  }
};

//feedPost
const feedPost = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("userId in feed:", typeof userId);
    const user = await User.findById(userId);
    console.log("user in feed:", typeof user);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy user" });
    }

    const following = user.following;

    const feedPost = await Post.find({ postedBy: { $in: following } }).sort({
      createAt: -1,
    });

    res.status(200).json( feedPost );
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in feedPost : ", error.message);
  }
};

export { createPost, getPost, deletePost, likePost, replyPost, feedPost };
