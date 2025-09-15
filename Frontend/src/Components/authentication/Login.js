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
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory(); // Invoke useHistory as a hook
   const { setUser } = ChatState();

  const handleClick = () => {
    setShow(!show);
  };
  const submitHandler = async () => {
    setLoading(true)
    if (!email || !password) {
      toast({
        title: "Email or Password may Incorrect!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
      return;
    }
    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };
      //make api call to post data
      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );
      toast({
        title: "User Login Successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data)
      setLoading(false);
      history.push("/chats");
    }
    catch (error) {
      console.log(error);
      toast({
        title: "Error occurred",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
    }
  };
  return (
    <VStack>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          type='email'
          placeholder="Enter your email id "
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Input>
          <InputRightElement width="4.5rem">
            <Button onClick={handleClick} h="1.75rem" size="sm">
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 10 }}
        onClick={submitHandler}
      >
        Login
      </Button>
      <Button
        variant={"solid"}
        colorScheme="red"
        width="100%"
        style={{ marginTop: 10 }}
        onClick={() => {
          setEmail("guest@gmail.com");
          setPassword("12345");
        }}
      >
        Login with Guest User
      </Button>
    </VStack>
  );
};

export default Login;
