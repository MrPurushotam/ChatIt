import { io } from "socket.io-client"
import { activeChatAtom, authenticatedAtom, chatsAtom, disconnectSocketAtom, messagesAtom, isUserConnectedToInternetAtom, globalLoadingAtom, isConnectedAtom } from "../states/atoms";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import React, { useCallback, useRef, useEffect, useState } from "react";
import initalizeApi from "./Api";
import useLoggedUser from "../Hooks/useLoggedUser";
import useNotificationSound from "../Hooks/useNotificationSound";

const SocketWrapper = ({ children }) => {
  const api = initalizeApi();
  const url = import.meta.env.VITE_SERVER_URL;
  const [chats, setChats] = useRecoilState(chatsAtom);
  const setMessages = useSetRecoilState(messagesAtom);
  const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
  const setAuthenticated = useSetRecoilState(authenticatedAtom);
  const [disconnectSocket, setDisconnectSocket] = useRecoilState(disconnectSocketAtom);
  const isConnectedToInternet = useRecoilValue(isUserConnectedToInternetAtom);
  const setGlobalLoading = useSetRecoilState(globalLoadingAtom);
  const setIsConnected = useSetRecoilState(isConnectedAtom);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const onlineChatsRef = useRef([]);
  const loggedUser = useLoggedUser();

  // infite chat scroll variables 
  const [hasMoreChats, setHasMoreChats] = useState(false);

  // notification hook 
  const notificationSound = useNotificationSound();

  const fetchChats = async (start = 0, end = 20) => {
    setIsConnected('inital-connect');
    setGlobalLoading("fetching-chats");
    try {
      const resp = await api.get(`/chat/${start}/${end}`);
      if (resp.data.success) {
        const allChats = resp.data.chats;
        if (allChats.length === start + end) {
          setHasMoreChats(true);
        }
        setChats(allChats);
      } else {
        console.log(resp.data.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    } finally {
      setGlobalLoading("");
      setIsConnected('');
    }
  };


  const ConnectToServer = useCallback(() => {
    // const socket_connection = io(url, { withCredentials: true });
    // Authorization Header
    const socket_connection = io(url, { extraHeaders: { Authorization: `Bearer ${window.localStorage.getItem("token")}` } });
    socketRef.current = socket_connection;
    socket_connection.on('connect', () => {
      console.log("connected")
      fetchChats();
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url, socketRef, isConnectedToInternet]);

  useEffect(() => {
    if (!socketRef.current && isConnectedToInternet) {
      ConnectToServer();
    }
  }, [ConnectToServer])

  useEffect(() => {
    if (disconnectSocket) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
        setDisconnectSocket(false);
      }
    }
  }, [disconnectSocket]);

  const handleOnlineChats = (onlineChats) => {
    onlineChatsRef.current = onlineChats;
    // Update currentTextingUser's online status if needed
    if (currentTextingUser) {
      const isCurrentUserOnline = onlineChats.includes(currentTextingUser.otherUserId);
      setCurrentTextingUser(prev => ({
        ...prev,
        isOnline: isCurrentUserOnline
      }));
    }
  };

  useEffect(() => {
    if (socketRef.current && onlineChatsRef.current.length > 0 && chats.length > 0) {
      if (chats.length > 0 && onlineChatsRef.current.length > 0) {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            const isOnline = onlineChatsRef.current.includes(chat.otherUserId);
            return {
              ...chat,
              isOnline
            };
          });
        });
      }

    }
  }, [socketRef.current, onlineChatsRef.current])

  const handleUserStatus = (userId, isOnline) => {
    setChats(prev => (
      prev.map(chat => chat.otherUserId === userId ? { ...chat, isOnline } : chat)
    ));
    
    // Update currentTextingUser's online status if it matches
    if (currentTextingUser?.otherUserId === userId) {
      setCurrentTextingUser(prev => ({
        ...prev,
        isOnline
      }));
    }
  }


  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current?.on("error", (error) => {
      if (error.message === "JwtTokenExpired" || error.data.jwtExpired) {
        window.localStorage.removeItem("token");
        setAuthenticated(false)
        navigate("/signin")
      } else {
        console.log("Error occured while connecting to socket server, ", error.message)
      }
    })
    socketRef.current?.on("created-chatId", (chatId) => {
      // First update chats
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.isTemporary && chat.otherUserId === currentTextingUser?.otherUserId 
            ? { ...chat, id: chatId, isTemporary: false }
            : chat
        )
      );
      
      // Then update current texting user separately
      if (currentTextingUser?.isTemporary) {
        setCurrentTextingUser(prev => ({
          ...prev,
          id: chatId,
          isTemporary: false
        }));
      }
    })

    socketRef.current?.on("online_contacts", (onlineChats) => handleOnlineChats(onlineChats))
    socketRef.current?.on("user_online", (userId) => handleUserStatus(userId, true))
    socketRef.current?.on("user_offline", (userId) => handleUserStatus(userId, false))
    socketRef.current?.on("receive_message", (newMessage) => {
      console.log("in recieve_messagee")
      setChats((prevChats) =>
        prevChats?.map((chat) =>
          chat.id === newMessage.chatId
            ? {
              ...chat,
              lastMessage: newMessage.content,
              lastMessageAt: newMessage.sentAt,
              unreadCount: chat.id === currentTextingUser?.id ? 0 : (chat.unreadCount || 0) + 1,
            }
            : chat
        )
      );
      if (currentTextingUser && currentTextingUser.id === newMessage.chatId && currentTextingUser.otherUserId === newMessage.senderId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        notificationSound();
      }
    });
    
    socketRef.current?.on("update_unread_count", (details) => {
      if (currentTextingUser?.id === details.chatId) {
        // Update currentTextingUser first
        setCurrentTextingUser(prev => ({ 
          ...prev, 
          unreadCount: details.unreadCount 
        }));
        
        // Then update chats separately
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === details.chatId 
              ? { ...chat, unreadCount: details.unreadCount } 
              : chat
          )
        );
      }
    })

    return () => {
      if (socketRef.current) {
        socketRef.current?.off("error")
        socketRef.current?.off("created-chatId")
        socketRef.current?.off("online_contacts")
        socketRef.current?.off("user_online", handleUserStatus)
        socketRef.current?.off("user_offline", handleUserStatus)
        socketRef.current?.off("receive_message")
        socketRef.current?.off("update_unread_count")
      }
    }
  }, [ConnectToServer]);


  return (
    <React.Fragment>
      {React.Children.map(children, child =>
        React.cloneElement(child, { socket: socketRef.current, loggedUser, fetchChats, hasMoreChats })
      )}
    </React.Fragment>
  )
}

export default SocketWrapper
