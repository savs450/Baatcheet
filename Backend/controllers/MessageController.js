const asyncHandler =  require('express-async-handler')
const Message = require('../Models/messageModels')
const User = require('../Models/UserModel')
const Chat = require('../Models/chatModels')


const sendMessage = asyncHandler(async (req, res)=>{
    const { content, chatId} = req.body   // content ,chatId idhar destructure kiye h jo ye model ka exact keyname hona chahiye kya ya khudse variable declare kiye h

    if(!content || !chatId){
        console.log('Invalid data passed into request')
        return res.sendStatus(400)
    }
    var newMessage = {
        sender : req.user._id , // isme user._id h ye kaisee pta chla muze idhr
        content :content,
        chat: chatId
    }
    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", 'name pic')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path:'chat.users',
            select: 'name pic email',
        })
    await Chat.findByIdAndUpdate(req.body.chatId,{
        latestMessage : message
    })
    res.json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})
const allMessage = asyncHandler(async (req, res)=>{
    try {
    const messages =  await Message.find({ chat : req.params.chatId }).populate('sender','name pic email').populate('chat')
    res.json(messages)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})
module.exports = { sendMessage ,allMessage}