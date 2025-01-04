import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

//sendMessage
async function sendMessage(req, res) {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user._id; //ID của người gửi (lấy từ middleware xác thực người dùng, ví dụ: JWT).

    //Tìm kiếm cuộc trò chuyện
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
      //$all: Xác nhận rằng mảng participants (các thành viên trong cuộc trò chuyện) chứa cả người gửi (senderId) và người nhận (recipientId)
    });

    //Tạo cuộc trò chuyện mới nếu chưa có
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId], //participants: Lưu danh sách hai người tham gia cuộc trò chuyện.
        lastMessage: {
          // Lưu tin nhắn cuối cùng
          text: message,
          sender: senderId,
        },
      });
      await conversation.save();
    }

    //Tạo và lưu tin nhắn mới
    const newMessage = new Message({
      text: message, //Nội dung tin nhắn.
      sender: senderId, //ID của người gửi.
      conversationId: conversation._id, //Gắn tin nhắn với ID của cuộc trò chuyện
    });

    //Lưu đồng thời tin nhắn và cập nhật cuộc trò chuyện
    await Promise.all([
      newMessage.save(), //Lưu tin nhắn mới vào collection message
      conversation.updateOne({
        //Cập nhật trường lastMessage trong tài liệu của cuộc trò chuyện.
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);

    res.status(201).json({ message: "goi tinh nhan thanh cong", newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//getMessages
async function getMessages(req, res) {
  const { otherUserId } = req.params;
  const userId = req.user._id; //ID của người dùng hiện tại (lấy từ middleware xác thực người dùng, ví dụ: JWT).
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });
    if (!conversation) {
      return res.status(404).json({ error: "Không tìm thấy cuộc hội thoại" });
    }
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: -1 }); //Sắp xếp tin nhắn theo thời gian tạo giảm dần.

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//getConversations
async function getConversations(req, res) {
  const userId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });
    res.status(200).json({ conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export { sendMessage, getMessages, getConversations };
