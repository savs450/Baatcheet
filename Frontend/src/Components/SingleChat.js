import { ArrowBackIcon } from '@chakra-ui/icons'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { getSender, getSenderFull } from '../config/ChatLogics'
import ProfileModal from './miscellaneous/ProfileModal'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal'
import { useState, useEffect } from 'react'
import axios from 'axios'
import './Styles.css'
import ScrollableChat from './ScrollableChat'
import { io } from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../animations/typing.json'

const ENDPOINT = process.env.NODE_ENV === 'production' ? window.location.host :'http://localhost:8000'
var socket , selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const toast = useToast()
  const { user, selectedChat, setSelectedChat,notification, setNotification} = ChatState()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

    const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

    useEffect(()=>{
    socket = io(ENDPOINT)
    socket.emit('setup',user)
    socket.on('connected',()=>setSocketConnected(true))
    socket.on("typing", ({ senderId }) => {
    if (senderId !== user._id) {
      setIsTyping(true);
    }
  });
   socket.on("stop_typing", ({ senderId }) => {
    if (senderId !== user._id) {
      setIsTyping(false);
    }
  });
  },[])

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages()
      selectedChatCompare = selectedChat;
    }
  }, [selectedChat])

  useEffect(()=>{
    socket.on('message_recieved',(newMessageRecieved)=>{
      if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id){
        if(!notification.includes(newMessageRecieved)){
          setNotification([newMessageRecieved, ...notification])
          setFetchAgain(!fetchAgain)
        }
      }
      else {
        setMessages([...messages,newMessageRecieved])
      }
    })
  })

  const fetchMessages = async () => {
    if (!selectedChat) return

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }

      setLoading(true)
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config)
      setMessages(data)
      setLoading(false)
      socket.emit('join_chat', selectedChat._id)
    } catch (err) {
      setLoading(false)
      toast({
        title: 'Error Occurred',
        status: 'error',
        description: 'Failed to Load Messages',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      })
    }
  }

  const sendMessage = async (e) => {
    if (e.key === 'Enter' && newMessage) {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        }

        const { data } = await axios.post(
          '/api/message',
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        )

        setNewMessage('')
        socket.emit('new_message',data)
        setMessages([...messages, data])
      } catch (error) {
        toast({
          title: 'Error Occurred',
          status: 'error',
          description: 'Failed to Send Message',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        })
      }
    }
  }



  const typingHandler = (e) => {
    setNewMessage(e.target.value)
    // TODO: Typing Indicator Logic
    if(!socketConnected) return;
    if(!typing)  {
      setTyping(true)
       socket.emit("typing", { room: selectedChat._id, senderId: user._id });
    }
    let lastTypingTime = new Date().getTime()
    var timerLength = 3000
    setTimeout(()=>{
      var timeNow = new Date().getTime()
      var timeDiff = timeNow - lastTypingTime;
      if(timeDiff >= timerLength && typing){
       socket.emit("stop_typing", { room: selectedChat._id, senderId: user._id });
        setTyping(false)
      }

    },timerLength)
  }

  return (
    <>
      {selectedChat ? (
        <>
          {/* Header */}
          <Text
            display="flex"
            justifyContent={{ base: 'space-between' }}
            alignItems="center"
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          {/* Messages Area */}
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <Box
              flex="1"
              overflow='auto'
              px={1}>
                <ScrollableChat messages={messages} />
              </Box>
            )}

            {/* Input */}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping ? <div>
                <Lottie
                options={defaultOptions}
                width={70}
                style={{marginBottom:15, marginLeft:0}}  />
              </div> :<></>}
              <Input
                variant="filled"
                bg="#F1F5F9"
                placeholder="Enter a message..."
                onChange={typingHandler}
                value={newMessage}
                boxShadow="0 2px 6px rgba(0, 180, 216, 0.3)"
              _focus={{
                bg: "#F1F5F9",
                boxShadow: "0 0 0 3px rgba(0, 180, 216, 0.5)",
                borderColor: "teal.400",
              }}
              _hover={{
              boxShadow: "0 2px 8px rgba(0, 180, 216, 0.4)",
              }}
               borderRadius="md"

              />
            </FormControl>
          </Box>
        </>
      ) : (
        // Fallback screen when no chat is selected
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting... 😊
          </Text>
        </Box>
      )}
    </>
  )
}

export default SingleChat
