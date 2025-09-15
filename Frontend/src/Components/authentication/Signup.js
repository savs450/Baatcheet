import React, { useState } from "react";

import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  InputGroup,
  Button,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import cloudinary from 'cloudinary-core';
import { ChatState } from "../../Context/ChatProvider";


const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [pic, setPic] = useState();
  const [show, setShow] = useState(false);
  const [loading,setLoading] = useState(false)
  const handleClick = () => setShow(!show);
  const toast = useToast()
  const history = useHistory();

  const {setUser} = ChatState();

  //to upload pics from frontend
  const cl = cloudinary.Cloudinary.new({ cloud_name: 'dljtfzyfe' });

  const postDetails = (pics)=>{
    setLoading(true)
    if(pics === undefined){
      toast({
        title:'Please select an Image!',
        status:'warning',
        duration:5000,
        isClosable:true,
        position:'top-right'
      })
      return;
    }
    if(pics.type ==='image/jpeg' ||pics.type ==='image/png'||pics.type ==='image/jpg'){
      const data = new FormData()
      data.append('file',pics)
      data.append('upload_preset','TalkAtive-chatapp')
      data.append("cloud_name",'dljtfzyfe')
      fetch('https://api.cloudinary.com/v1_1/dljtfzyfe/image/upload',{
        method:'post',
        body:data
      }).then((res)=>res.json())
      .then(data =>{
        // console.log("uploaded pics:",data)
        setPic(data.url.toString())
        console.log(data.url.toString())
        setLoading(false)
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
      })
    }
    else{
      toast({
        title:'Please select an Image!',
        status:'warning',
        duration:5000,
        isClosable:true,
        position:'top-right'
      })
      setLoading(false)
      return;
    }

  }

  const submitHandler = async() =>{
    setLoading(true)
    if(!name || !email || !password ||!confirm_password){

      toast({
        title:'Please fill all Fields!',
        status:'warning',
        duration:5000,
        isClosable:true,
        position:'top-right'
      })
      console.log({name,email,password,confirm_password})
      setLoading(false)
      return
    }
    if(password !== confirm_password ){
      toast({
        title:"Password doesn't matched",
        status:'warning',
        duration:5000,
        isClosable:true,
        position:'top-right'
      })
      return;
    }
    //If everything is ok now Data should be stored in DB
    try {
      const config = {
        headers:{
          "Content-type": "application/json"
        }
      }
      const {data} = await axios.post('api/user',{name,email,password,pic},config)
      toast({
        title:'User Signed Up Successfully',
        status:'success',
        duration:5000,
        isClosable:true,
        position:'top-right'
      })
      localStorage.setItem('userInfo',JSON.stringify(data))
      setUser(data);
      setLoading(false);
      history.push("/chats");


    } catch (error) {
      console.log("Error occurred in Signup",error)
      toast({
        title:'Error occurred',
        description:error.response.data.message,
        status:'error',
        duration:5000,
        isClosable:true,
        position:'top-right'
      })
      setLoading(false)
    }

  }
  return (
    <VStack spacing="3px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter your name"
          onChange={(e) => setName(e.target.value)}
        ></Input>
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter your email id"
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
        <FormHelperText>We'll never share your email.</FormHelperText>
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? 'text':"password"}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
          ></Input>
          <InputRightElement width="4.5rem">
            <Button onClick={handleClick}
            h='1.75rem' size='sm'
            >{show ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="confim_password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? 'text':"password"}
            placeholder="Enter your password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></Input>
          <InputRightElement width="4.5rem">
            <Button onClick={handleClick}
            h='1.75rem' size='sm'
            >{show ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic" >
        <FormLabel>Profile Pic</FormLabel>
        <Input
         type='file'
         p={1.5}
         accept="image/"
          onChange={(e) => postDetails(e.target.files[0])}
        ></Input>
      </FormControl>

      <Button
      colorScheme="blue"
      width='100%'
      style={{marginTop:15}}
      onClick={submitHandler}
      isLoading = {loading}>
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
