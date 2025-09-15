import axios from "axios";
import { createContext, useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
const ChatContext = createContext();

const ChatProvider = ({ children }) => {
 const [user, setUser] = useState(() => {
  return JSON.parse(localStorage.getItem("userInfo")) || null;
});
  const [ selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  const history = useHistory();

  const fetchChats = async () => {
    if (!user) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      console.error("Failed to load chats", error);
    }
  };


   useEffect(() => {
    if (!user) {
      history.push("/");
    } else {
      fetchChats();  // ✅ signup/login ke turant baad chats fetch ho jayenge
    }
  }, [history, user]);

  return (
    <ChatContext.Provider value={{
      user, setUser,
      selectedChat, setSelectedChat,
      chats, setChats,
      notification, setNotification,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
