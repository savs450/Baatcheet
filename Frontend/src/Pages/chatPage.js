import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@chakra-ui/react";
import SideDrawer from "../Components/miscellaneous/SideDrawer";
import MyChats from "../Components/miscellaneous/MyChats";
import ChatBox from "../Components/miscellaneous/ChatBox";
import { ChatState } from "../Context/ChatProvider"
import bgForChat2 from '../assest/bgForChat2.jpg'


   const ChatPage = () => {
   const { user } = ChatState();
   const [fetchAgain, setFetchAgain] = useState(false)
   const [chats, setChats] = useState([]);
   // const [selectedChat, setSelectedChat] = useState(null);

  return (
   <div style={{
      width: "100%", backgroundImage: `url(${bgForChat2})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
   }} >
      {user && <SideDrawer
          chats={chats}
          setChats={setChats}

          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}/>}
      <Box
         display="flex"
         justifyContent='space-between'
         w='100%'
         h='91.5vh'
         p='10px'
      >
         {user && <MyChats
            chats={chats}
            setChats={setChats}
            fetchAgain={fetchAgain}  />}
         {user && <ChatBox


            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain} />}

      </Box>
   </div>
)};


export default ChatPage;
