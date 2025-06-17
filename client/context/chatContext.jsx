import { createContext, useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { useEffect } from "react";


export const chatContext = createContext();

export const chatProvider = ({children}) => {

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const {socket, axios} = useContext(AuthContext);

  const getUsers = async() => {
    try {
      const { data } = await axios.get('/api/messages/users');
      if(data.success){
        setUsers(data.users)
        setUnseenMessages(data.unseenMessages)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getMessages = async(userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if(data.success){
        setMessages(data.messages)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const sendMessage = async(messageData) => {
    try {
      const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if(data.success){
        setMessages(() => [...prevMessage, data.newMessage])
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  //Function to get(subscribe) to a user messages in realtime
  const subscribeToMessages = async() => {
    if(!socket) return;

    socket.on("newMessage", (newMessage) => {
      if(selectedUser && newMessage.senderId === selectedUser._id){
        newMessage.seen = true;
        setMessages((prevMessage) => [...prevMessages, newMessage]);
    axios.put(`/api/messages/mark/${newMessage._id}`)
      }else{
        setUnseenMessages((prevUnseenMessages) => ({
            ...prevUnseenMessages, [newMessage.senderId] : 
            prevUnseenMessages[newMessage.senderId] ? prevMessages[newMessage.senderId] + 1 : 1
        }))
      }
    })
  }

  //function to unsubscribe from Messages
  const unsubscribeFromMessages = () => {
    if(socket) socket.off('newMessage')
  }

  useEffect(() => {
    subscribeToMessages();
    return ()=> unsubscribeFromMessages()
  }, [socket, selectedUser])

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages, setUnseenMessages
  };

  return (
    <chatContext.Provider value={value}>
      {children}
    </chatContext.Provider>
  )
}