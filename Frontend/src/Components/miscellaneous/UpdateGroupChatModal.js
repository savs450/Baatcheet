
import {useState , useEffect} from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import axios from 'axios';
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from '../userAvatar/UserBadgeItem';
import useDebounce from '../../config/useDebounce';
import UserListItem from '../userAvatar/UserListItem';
import { select } from 'framer-motion/client';


const UpdateGroupChatModal = ({fetchAgain, setFetchAgain , fetchMessages}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const {selectedChat, setSelectedChat, user} = ChatState();
    const [groupChatName, setGroupChatName] = useState(null);
    const [search, setSearch] = useState('')
    const [searchResult,setSearchResult] = useState([])
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false)

    const toast= useToast();
    const debouncedSearch = useDebounce(search, 500);


    const handleRemove = async(user1) =>{
         if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id){
        toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages()
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
    }
    const handleAddUser = async (user1)=>{
        if(selectedChat.groupAdmin._id !== user._id && user1._id !== user._id){
        toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return ;
        }
    if(selectedChat.groupAdmin._id !== user._id){
        toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
        setLoading(true)
        const config = {
            headers: { Authorization: `Bearer ${user.token}`,} };
            const {data} = await axios.put('/api/chat/groupadd',{
                chatId: selectedChat._id,
                userId: user1._id,
            },config)
      setSelectedChat(data)
      setFetchAgain(!fetchAgain)
      setRenameLoading(false)

    } catch (err) {
     toast({
        title: "Error Occured!",
        description: err.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false)
    }

    }
    const handleRename =async()=>{
        if(!groupChatName) return ;
        try {
            setRenameLoading(true)
            const config = {
            headers: { Authorization: `Bearer ${user.token}`,},
      };
      const {data} = await axios.put('/api/chat/rename',{
        chatId: selectedChat._id,
        chatName : groupChatName,
      },config)
      setSelectedChat(data)
      setFetchAgain(!fetchAgain)
      setRenameLoading(false)

    } catch (err) {
 toast({
        title: "Error Occured!",
        description: err.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false)
        }
    }
    useEffect(() => {
     if (process.env.NODE_ENV !== "production") {
    console.log("useDebounce calling...", { search, debouncedSearch });
  }

    const fetchUsers = async () => {

    if (!debouncedSearch.trim()  || !isOpen) {
        setSearchResult([])
        return ;
    }
    await handleSearch(debouncedSearch);
  };
  fetchUsers();
}, [debouncedSearch , isOpen]);


const handleSearch = async (query) => {
    if (!query.trim()) {
        setSearchResult([])
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setSearchResult([])
    }
    finally{
        setLoading(false)
    }
  };


  return (
    <>
      <IconButton
      display={{base:'flex'}}
      icon={<ViewIcon/>}
      onClick={onOpen}>Open Modal</IconButton>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w='100%' display='flex' flexWrap='wrap' pb={3}>
                {selectedChat.users.map((u)=>(
                     <UserBadgeItem
                            key={u._id}
                            user={u}
                            handleFunction={()=>handleRemove(u)} />
                ))}
            </Box>
            <FormControl display='flex' >
                <Input
                placeholder='Chat Name'
                mb={3}
                value={groupChatName}
                onChange={(e)=> setGroupChatName(e.target.value)}
               />
                <Button
                variant='solid'
                colorScheme='teal'
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
                >Update
                </Button>
            </FormControl>
            <FormControl>
                <Input placeholder='Add User to group'
                mb={1}
                onChange={(e)=> setSearch(e.target.value)}
                />
            </FormControl>
            {loading ? <Spinner size='lg'/>
            :(searchResult?.map((user)=> (
                <UserListItem
                key={user._id}
                user={user}
                handleFunction={()=>handleAddUser(user)} />
            )) )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='red' onClick={()=>handleRemove(user)} >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModal
