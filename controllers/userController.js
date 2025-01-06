import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndCookie from "../utils/helpers/generateTokenAndCookie.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";
import { query } from "express";
import Post from "../models/postModel.js";


//getUserProfile
const getUserProfile = async (req, res) => {
  const {query} = req.params;
  console.log("query in getUserProfile:",query);
  try {
    let user ;
    //truy vấn UserId;
    if(mongoose.Types.ObjectId.isValid(query)){
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updateAt");
    }else{

       user = await User.findOne({username:query}).select("-password").select("-updateAt");
    }
    if (!user) {
       return res.status(400).json({ error: "Không tìm thấy User"});
    }


    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in getUserProfile : ",error.message);
  }
};
//signup user
const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    // const user = await User.findOne({ $or: [{ email }, { username }] }); // kiem tra xem email hay username do da ton tai chua
    const isUsername = await User.findOne({ username });
    const isEmail = await User.findOne({ email });
    if (!name || !email || !username || !password){
        return res.status(400).json({ error: "Vui lòng điền đủ thông tin" });
    }
    if (isUsername) {
      return res.status(400).json({ error: "Username đã tồn tại" });
    }
    if (isEmail) {
      return res.status(400).json({ error: " Email đã tồn tại" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải lớn hơn 6 kí tự" });
    }

    //mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    if (newUser) {
      generateTokenAndCookie(newUser._id, res);

      res.status(200).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
        message: "Tạo tài khoản thành công !",
      });
    } else {
      res.status(400).json({ error: "Tạo tài khoản thất bại" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error in sigupUser : ", error.message);
  }
};

//login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
   
    if (!user) {
      return res.status(400).json({ error: "Username không tồn tại !" });
    }
    if (user && !isPasswordCorrect) {
       res.status(400).json({ error: "Sai mật khẩu" });
       return
    }

    generateTokenAndCookie(user._id, res);
    console.log("dang nhap BE thanh cong");
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio:user.bio,
      profilePic:user.profilePic,
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginUser : ", error.message);
  }
};

//logout user
const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: " Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in logoutUser : ", error.message);
  }
};

//follow

const followAndUnFollow = async (req, res) => {
  try {
    const { id } = req.params; //Lấy ID của người dùng mà bạn muốn theo dõi hoặc hủy theo dõi từ tham số URL
    const userToModify = await User.findById(id); //Tìm người dùng theo ID để thực hiện hành động (theo dõi/hủy theo dõi).
    const currentUser = await User.findById(req.user._id); //Tìm người dùng hiện tại (người đã đăng nhập) dựa trên _id được lưu trong req.user (được thiết lập bởi middleware protectRoute).

    // Kiểm tra xem id có phải ObjectId hợp lệ không
    console.log("id " + id);
    console.log("req.user._id " + req.user._id);
    if (id === req.user._id.toString()) {
      console.log("req.user._id ".req.user._id);
      console.log("._id ", id);
      return res
        .status(400)
        .json({ error: " Bạn không thể follow/unfollow chính bạn" });
    }
    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "Không tìm thấy user ! " });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res.status(200).json({ message: "Hủy follow người dùng thành công" });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      res.status(200).json({ message: " Follow người dùng thành công" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in followAndUnFollow : ", error.message);
  }
};

//update User
const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let {profilePic} = req.body;
  console.log("profilePic in controller", profilePic);
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      res.status(400).json({ error: "Không tìm thấy user để cập nhật" });
    }
    if (req.params.id !== userId.toString()) {
      console.log(
        "req.params.id:",
        req.params.id,
        "userId.toString():",
        userId.toString()
      );
      return res
        .status(400)
        .json({ error: "Bạn không thể cập nhật user của bạn" });
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      // bcrypt.genSalt(10) được gọi để tạo ra một muối (salt) với độ dài được xác định. Tham số 10 là số "rounds" (số vòng lặp) mà bạn muốn sử dụng để tạo muối.
      // Muối là một chuỗi ngẫu nhiên được thêm vào mật khẩu trước khi băm để đảm bảo rằng ngay cả khi hai người dùng có cùng một mật khẩu, đầu ra băm vẫn sẽ khác nhau.
      // await được sử dụng ở đây vì genSalt trả về một Promise, và chúng ta muốn đợi cho Promise đó hoàn thành trước khi tiếp tục.
      const hashedPassword = await bcrypt.hash(password, salt);
      // bcrypt.hash(password, salt) được gọi để băm mật khẩu với muối đã tạo ra.
      // Hàm này sẽ trả về một chuỗi đã được băm mà bạn có thể lưu trữ trong cơ sở dữ liệu thay vì lưu mật khẩu gốc.
      // Cũng giống như trước, await được sử dụng để đợi cho quá trình băm hoàn tất trước khi tiếp tục.

      user.password = hashedPassword;

    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0])
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name=name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();
    user.password = null;
    //tìm tất cả bài viết của user replies và update username và ảnh
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );
    res.status(200).json({message :"Cập nhật thông tin thành công" ,user})
      console.log(
        "update thanh cong req.params.id:",
        req.params.id,
        "userId.toString():",
        userId.toString()
      );
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser : ", error.message);
  }
};


export {
  signupUser,
  loginUser,
  logoutUser,
  followAndUnFollow,
  updateUser,
  getUserProfile,
};
