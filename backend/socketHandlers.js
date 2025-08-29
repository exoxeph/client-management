const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Assuming socketHandlers is in the backend root
const Message = require('./models/Message');
const Chat = require('./models/Chat');
const Individual = require('./models/Individual');
const Corporate = require('./models/Corporate');

const initializeSocket = (io) => {
  // --- This middleware runs for EVERY new connection ---
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided.'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).lean();
      
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }
      
      // --- THIS IS THE CRITICAL STEP ---
      // Securely attach user data to the socket for future use.
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userEmail = user.email; // For logging
      
      next(); // Authentication successful, allow connection.
    } catch (error) {
      console.error("Socket Auth Middleware Error:", error.message);
      next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    // By the time this code runs, we KNOW the socket is authenticated.
    console.log(`✅ User connected and authenticated: ${socket.userEmail}`);

    // Everyone gets a user-specific room (useful for direct emits)
     socket.join(`user_${socket.userId}`);
     console.log(`joined personal room user_${socket.userId}`);

   


     socket.on('send_message', async (data) => {
        try {
          const { chatId, content, tempId } = data;
          const senderId = socket.userId;
          const senderRole = socket.userRole;

         // verify membership + get participants for fanout
          const chatDoc = await Chat.findById(chatId).select('participants').lean();
          if (!chatDoc || !chatDoc.participants.some(p => p.user.toString() === senderId)) {
            socket.emit('error', { message: 'Access denied to chat' });
            return;
          }

          // --- FINAL, CORRECT NAME-FINDING LOGIC ---
          let senderName;
          if (senderRole === 'admin') {
            senderName = "Admin Support";
          } else {
            const sender = await User.findById(senderId).lean();
            if (sender.accountType === 'individual') {
              const profile = await Individual.findOne({ user: senderId }).lean();
              senderName = profile?.fullName || sender.email;
            } else if (sender.accountType === 'corporate') {
              const profile = await Corporate.findOne({ user: senderId }).lean();
              // Use the name from the primary contact object
              senderName = profile?.primaryContact?.name || sender.email; 
            } else {
              senderName = sender.email; // Fallback
            }
          }
          // --- END OF NEW LOGIC ---

          const newMessage = new Message({
            chat: chatId,
            sender: { user: senderId, name: senderName, role: senderRole },
            content: content.trim()
          });
          await newMessage.save();

          await Chat.findByIdAndUpdate(chatId, {
            lastMessage: newMessage._id,
            lastActivity: new Date()
          });

          const populatedMessage = await Message.findById(newMessage._id).populate('sender.user', 'email role').lean();
          
          io.to(chatId).emit('new_message', { chatId, message: populatedMessage, tempId });
          // 2) Everyone else (including those NOT in the room yet) gets a preview update
                const preview = {
                  _id: chatId,
                  lastMessage: populatedMessage,
                  lastActivity: newMessage.createdAt
                };
                chatDoc.participants.forEach(p => {
                  const uid = p.user.toString();
                  io.to(`user_${uid}`).emit('chat_updated', preview);
                });
          console.log(`✅ Message sent successfully in chat ${chatId}`);

        } catch (error) {
          console.error(`❌ Error in send_message: ${error.message}`);
          socket.emit('error', { message: 'Failed to send message.' });
        }
      });


    socket.on('join_chat', ({ chatId }) => {
    socket.join(chatId);                   // <-- raw chatId
    console.log(`${socket.userEmail} joined room: ${chatId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected: ${socket.userEmail}. Reason: ${reason}`);
    });
  });
};

module.exports = { initializeSocket };