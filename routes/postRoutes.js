import express from "express";
import { createPost, deletePost, feedPost, getPost, likePost, replyPost } from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";


const route = express.Router();

route.get("/feed", protectRoute, feedPost);
route.get("/:id", getPost);
route.post("/create", protectRoute, createPost);
route.delete("/:id",protectRoute, deletePost);
route.post("/like/:id", protectRoute, likePost);
route.post("/reply/:id", protectRoute, replyPost);

export default route;