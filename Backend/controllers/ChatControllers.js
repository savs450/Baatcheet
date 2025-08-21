const expressAsyncHandler = require("express-async-handler");
const User = require("../Models/UserModel");
const Chat = require("../Models/chatModels");

const accessChat = expressAsyncHandler(async  (req, res) =>{
    const {userId} = req.body;
    if(!userId){
        console.log("userId param not sent with request");
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({
        isGroupChat :false,
        $and: [
            {users: {$elemMatch : {$eq : req.user._id}}},
            {users: {$elemMatch: {$eq: userId}}},
        ],
    }).populate("users","-password")    //except password
      .populate("latestMessage")

      isChat = await User.populate(isChat,{
        path: 'latestMessage.sender',
        select: 'name pic email',
      })
      if(isChat.length >0 ){
        res.send(isChat[0]);
      }
      else{
        var chatData ={
        chatName : "sender",
        isGroupChat : false,
        users:[req.user._id, userId],
      }
      }
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({_id:createdChat._id}).populate("users","-password")
        res.status(200).send(FullChat)
      } catch (err) {
        res.status(400);
        throw new Error(err.message)
      }
})


const fetchChats = expressAsyncHandler(async (req, res)=>{
  //just check which user is logged in and query for that user all of the chats
  try {
    let results = await Chat.find({users: {$elemMatch :{$eq: req.user._id}}})
    .populate("users","-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({updatedAt:-1})       // sort chats new to old

      results = await User.populate(results,{
        path: 'latestMessage.sender',
        select: 'name pic email',
      })

     res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message)
  }
});
const createGroupChat = expressAsyncHandler(async (req, res)=>{
  if(!req.body.users || !req.body.name){
    return res.status(400).send({message : "Please fill all fields"})
  }
  var users = JSON.parse(req.body.users);
  if(users.length <2){
    return res.status(400).send("More than 2 users are required to form a Group Chat !")
  }
  users.push(req.user)
  try{
    const groupChat = await Chat.create({
      chatName : req.body.name,
      users : users,
      isGroupChat : true,
      groupAdmin : req.user
    })
    const fullGroupChat = await Chat.findOne({_id: groupChat._id})
     .populate("users","-password")
     .populate("groupAdmin","-password")
     res.status(200).json(fullGroupChat);
  }
  catch(error){
    res.status(400);
    throw new Error(error.message)
  }

})
const renameGroup = expressAsyncHandler(async(req, res)=>{
  const {chatId , chatName} = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(chatId,{chatName},{new: true})
  .populate("users","-password")
  .populate("groupAdmin","-password")
  if(!updatedChat){
    res.status(404);
    throw new Error("Chat not found");
  }
  else{
    res.json(updatedChat)
  }
})
const addToGroup = expressAsyncHandler(async(req, res)=>{
  const {chatId, userId}= req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {$push:{users:userId}},
    {new:true})
    .populate("users","-password")
  .populate("groupAdmin","-password")
  if(!added){
    res.status(404);
    throw new Error("Chat not Found")
  }
  else{
    res.json(added);
  }
})
const removeFromGroup = expressAsyncHandler(async(req, res)=>{
  const {chatId, userId}= req.body;
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {$pull:{users:userId}},
    {new:true})
    .populate("users","-password")
  .populate("groupAdmin","-password")
  if(!removed){
    res.status(404);
    throw new Error("Chat not Found")
  }
  else{
    res.json(removed);
  }
})
module.exports ={accessChat,fetchChats,createGroupChat,renameGroup,addToGroup,removeFromGroup};