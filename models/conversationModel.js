import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema({
    participants:[{type:mongoose.Types.ObjectId,ref:"User"}],
    lastMessage : {
        text :String,
        sender : {type:mongoose.Schema.Types.ObjectId,ref:"User"}
    }
},{timestamps:true});

const Conversation = mongoose.model("conversation", conversationSchema);
export default Conversation;