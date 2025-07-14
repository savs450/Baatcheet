const express = require('express')
const { chats } = require('./data/data')
const UserRoutes = require('./Routes/UserRoutes')
const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

connectDB()
const app = express()

app.use(express.json()) //to accept json data

app.get('/',(req,res)=>{
    res.send("API is running")
})
app.use('/api/user',UserRoutes)
app.get('/api/chat',(req,res)=>{
    res.send(chats)
})
app.use(notFound)
app.use(errorHandler)
app.listen (8000,console.log("server started on port 8000"))