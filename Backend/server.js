const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const UserRoutes = require('./Routes/UserRoutes');
const ChatRoutes = require('./Routes/ChatRoutes');
const MessageRoutes = require('./Routes/MessageRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path')

connectDB();
const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['*']
  : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());


app.use('/api/user', UserRoutes);
app.use('/api/chat', ChatRoutes);
app.use('/api/message', MessageRoutes);

/********************* DEPLOYMENT **********************************************/

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "../Frontend", "build", "index.html"))
  );
}
else{
  app.get('/', (req, res) => {
      res.send("API is running");
  });
}


app.use(notFound);
app.use(errorHandler);

const PORT =  process.env.PORT || 8000
const server = app.listen(PORT, console.log("Server started on port 8000"));
const io = require('socket.io')(server,{
    pingTimeout:60000,
    cors:{ origin: allowedOrigins,}
})

io.on('connection',(socket)=>{
    // console.log("connected to socket.io")

    socket.on("setup", (userData) => {
    socket.join(userData._id)             //created a room for particular user
    socket.emit('connected')
  });

  socket.on('join_chat',(room) =>{
    socket.join(room)
    // console.log('Room_id-',room)
  })

socket.on("typing", ({ room, senderId }) => {
    socket.in(room).emit("typing", { senderId });
  });

  socket.on("stop_typing", ({ room, senderId }) => {
    socket.in(room).emit("stop_typing", { senderId });
  });

//logic for Group chatting (like 5 memebers in group if anyone emits/sends message it should be recieved by 4 others)

  socket.on('new_message',(newMessageRecieved) =>{
    var chat = newMessageRecieved.chat
    if(!chat.users) return console.log('Chat.users not defined')
    chat.users.forEach(user =>{
        if(user._id == newMessageRecieved.sender._id)
            return ;
        socket.in(user._id).emit('message_recieved',newMessageRecieved)
    })

})

socket.off("setup", (userData) => {
    console.log('user disconnected')
    socket.leave(userData._id)
  });
})



