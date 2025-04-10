import { io } from "socket.io-client"
import { activeChatAtom, authenticatedAtom, chatsAtom, disconnectSocketAtom, messagesAtom, isUserConnectedToInternetAtom, globalLoadingAtom, isConnectedAtom } from "../states/atoms";
import { useNavigate } from "react-router-dom";
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import React, { useCallback, useRef, useEffect, useState } from "react";
import initalizeApi from "./Api";
import useLoggedUser from "../Hooks/useLoggedUser";
import useNotificationSound from "../Hooks/useNotificationSound";

const SocketWrapper = ({ children }) => {
  const api = initalizeApi();
  const url = import.meta.env.VITE_SERVER_URL;
  const [chats, setChats] = useRecoilState(chatsAtom);
  const [currentTextingUser, setCurrentTextingUser] = useRecoilState(activeChatAtom);
  const setAuthenticated = useSetRecoilState(authenticatedAtom);
  const [disconnectSocket, setDisconnectSocket] = useRecoilState(disconnectSocketAtom);
  const isConnectedToInternet = useRecoilValue(isUserConnectedToInternetAtom);
  const setGlobalLoading = useSetRecoilState(globalLoadingAtom);
  const [isConnected, setIsConnected] = useRecoilState(isConnectedAtom);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const onlineChatsRef = useRef([]);
  const loggedUser = useLoggedUser();

  // infite chat scroll variables 
  const [hasMoreChats, setHasMoreChats] = useState(false);

  // notification hook 
  const notificationSound = useNotificationSound();

  const fetchChats = async (start = 0, end = 20) => {
    setGlobalLoading("fetching-chats");
    try {
      const resp = await api.get(`/chat/${start}/${end}`);
      if (resp.data.success) {
        const allChats = resp.data.chats;
        if (allChats.length === start + end) {
          setHasMoreChats(true);
        }
        setChats(allChats);
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
      console.log("connected");
      setIsConnected("connected")
    });
    socket_connection.on('connect_error', (error) => {
      console.error("Socket connection error:", error);
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
    if (socketRef.current && isConnected === "connected") {
      const initialLoadingType = "inital-connect";
      setIsConnected(initialLoadingType);
      fetchChats();
      setIsConnected("");
    }
  }, [isConnected, fetchChats, socketRef])

  useEffect(() => {
    if (disconnectSocket) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
        setDisconnectSocket(false);
      }
    }
  }, [disconnectSocket]);

  const handleOnlineChats = useRecoilCallback(({ snapshot, set }) => async (onlineChats) => {
    onlineChatsRef.current = onlineChats;
    const currentUser = await snapshot?.getPromise(activeChatAtom);
    if (currentUser) {
      const isCurrentUserOnline = onlineChats.includes(currentUser.otherUserId);
      set(chatsAtom, (prevChats) =>
        prevChats.map(chat => chat?.otherUserId === currentUser?.otherUserId ? { ...chat, isOnline: isCurrentUserOnline } : chat)
      )
      set(activeChatAtom, prev => ({
        ...prev,
        isOnline: isCurrentUserOnline
      }));
    }
  })

  const updateMessages = useRecoilCallback(({ snapshot, set }) => async (newMessage) => {
    const currentUser = await snapshot?.getPromise(activeChatAtom);

    if (String(currentUser?.id) === String(newMessage.chatId)) {
      set(messagesAtom, (oldMsgs) => [...oldMsgs, newMessage]);
    } else {
      try {
        notificationSound();
      } catch (error) {
        console.error("Error playing notification sound:", error);
      }

    }

    set(chatsAtom, (prevChats) =>
      prevChats.map((chat) =>
        chat.id === newMessage.chatId
          ? {
            ...chat,
            lastMessage: newMessage.content,
            lastMessageAt: newMessage.sentAt,
            unreadCount:
              chat.id === currentUser?.id
                ? chat.unreadCount
                : (chat.unreadCount || 0) + 1,
          }
          : chat
      )
    );
  });


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

  const handleUserStatus = useRecoilCallback(({ snapshot, set }) => async (userId, isOnline) => {
    const currentUser = await snapshot?.getPromise(activeChatAtom);
    set(chatsAtom, (prev) => (
      prev?.map(chat => chat.otherUserId === userId ? { ...chat, isOnline } : chat)
    ));

    if (currentUser?.otherUserId === userId) {
      set(activeChatAtom, prev => ({
        ...prev,
        isOnline
      }));
    }
  })

  const updateChatidOfTemporaryChat = useRecoilCallback(({ snapshot, set }) => async (chatId) => {
    const currentUser = await snapshot?.getPromise(activeChatAtom);
    set(chatsAtom, (prev) => (
      prev?.map(chat => chat.otherUserId === currentUser?.otherUserId ? { ...chat, id: chatId, isTemporary: false } : chat)
    ))
    if (currentUser?.isTemporary) {
      set(activeChatAtom, prev => ({
        ...prev,
        id: chatId,
        isTemporary: false
      }));

    }
  })

  const updateUnreadCount = useRecoilCallback(({ snapshot, set }) => async (details) => {
    const currentUser = await snapshot?.getPromise(activeChatAtom);
    if (currentUser?.id === details.chatId) {
      set(currentTextingUser, prev => ({
        ...prev,
        unreadCount: details.unreadCount
      }));
    }
    set(activeChatAtom, (prev) => {
      prev.map(chat => chat.id === details.chatId ? { ...chat, unreadCount: details.unreadCount } : chat)
    })
  })

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

    socketRef.current?.on("created-chatId", updateChatidOfTemporaryChat)
    socketRef.current?.on("online_contacts", (onlineChats) => handleOnlineChats(onlineChats))
    socketRef.current?.on("user_online", (userId) => handleUserStatus(userId, true))
    socketRef.current?.on("user_offline", (userId) => handleUserStatus(userId, false))
    socketRef.current?.on("receive_message", updateMessages)


    socketRef.current?.on("update_unread_count", updateUnreadCount)

    return () => {
      if (socketRef.current) {
        socketRef.current?.off("error")
        socketRef.current?.off("created-chatId", updateChatidOfTemporaryChat)
        socketRef.current?.off("online_contacts", handleOnlineChats)
        socketRef.current?.off("user_online", handleUserStatus)
        socketRef.current?.off("user_offline", handleUserStatus)
        socketRef.current?.off("receive_message", updateMessages)
        socketRef.current?.off("update_unread_count", updateUnreadCount)
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
