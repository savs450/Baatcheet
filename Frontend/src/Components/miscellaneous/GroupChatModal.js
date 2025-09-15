import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure, Button,
    useToast,
    FormControl,
    Input,
    Box
} from '@chakra-ui/react'
import axios from 'axios'
import { useState ,useEffect } from 'react'
import { ChatState } from '../../Context/ChatProvider'
import { Spinner } from "@chakra-ui/react"
import useDebounce from '../../config/useDebounce'
import UserListItem from '../userAvatar/UserListItem'
import UserBadgeItem from '../userAvatar/UserBadgeItem'



const GroupChatModal = ({ children }) => {
    const { user, chats, setChats } = ChatState();

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const toast = useToast()


   const debouncedSearch = useDebounce(search, 500);

    const handleGroup = (userToAdd) =>{
        if(selectedUsers.includes(userToAdd)){
            toast({
                title: "User already added",
                status: 'warning',
                duration : 5000,
                isClosable: true,
                position: 'top'
            })
            return ;
        }
        setSelectedUsers([...selectedUsers, userToAdd])
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
    // setSearch(query);
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

    const handleSubmit = async() => {
        if(!groupChatName || !selectedUsers){
            toast({
                title:"Please fill all the details",
                status: 'warning',
                duration: 5000,
                isClosable:true,
                position:'top'
            })
            return;
        }
        try {
            const config ={
                headers :{
                    Authorization: `Bearer ${user.token}`
                }
            }
            const {data} = await axios.post('/api/chat/group',{
                name: groupChatName,
                users : JSON.stringify(selectedUsers.map((u)=>u._id))
            }, config)
            setChats([data, ...chats])
            onClose();
            toast({
                title:'New Group Chat created',
                status: 'success',
                duration:5000,
                isClosable: true,
                position:'bottom'
            })
        } catch ( err) {
            toast({
                title:'Failed to create the chat',
                description:err.response.data,
                status: 'error',
                duration:5000,
                isClosable: true,
                position:'bottom'
            })
        }
     }
    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id))
    }


    return (
        <>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                        fontSize='35px'
                        fontFamily="Worksans"
                        display="flex"
                        justifyContent="center"
                    >Create Group Chat</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display='flex'
                        flexDir="column"
                        alignItems='center'>
                        <FormControl>
                            <Input
                                placeholder="Chat Name"
                                mb={3}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder='Add users eg: John'
                                mb={1}
                                value={search}
                                onChange={(e)=> setSearch(e.target.value)}
                                />
                        </FormControl>
                        <Box w="100%" display="flex" flexWrap='wrap'>
                            {selectedUsers.map((u)=>(
                            <UserBadgeItem
                            key={u._id}
                            user={u}
                            handleFunction={()=>handleDelete(u)} />
                        ))}

                        </Box>
                        {loading ? (<Spinner/>) :(
                            searchResult?.slice(0,4).map((user)=>(
                                <UserListItem
                                key={user._id}
                                user = {user}
                                handleFunction={()=> handleGroup(user)}
                                />
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>
                            Create Chat
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )

}

export default GroupChatModal
