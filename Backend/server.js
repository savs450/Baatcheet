const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const UserRoutes = require('./Routes/UserRoutes');
const ChatRoutes = require('./Routes/ChatRoutes');
const MessageRoutes = require('./Routes/MessageRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send("API is running");
});
console.log("JWT_SECRET:", process.env.JWT_SECRET);
app.use('/api/user', UserRoutes);
app.use('/api/chat', ChatRoutes);
app.use('/api/message', MessageRoutes);


app.use(notFound);
app.use(errorHandler);

app.listen(8000, console.log("Server started on port 8000"));
