import express from "express";
import { createPost, deletePost, feedPost, getPost, getUserPosts, likePost, replyPost } from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";


const route = express.Router();

route.get("/feed", protectRoute, feedPost);
route.get("/:id", getPost);
route.get("/user/:username", getUserPosts);
route.post("/create", protectRoute, createPost);
route.delete("/:id",protectRoute, deletePost);
route.put("/like/:id", protectRoute, likePost);
route.put("/reply/:id", protectRoute, replyPost);

export default route;