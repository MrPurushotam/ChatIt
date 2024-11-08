const { Server } = require("socket.io")
const { SocketIdMiddleware, createChatIdOrGetChatId } = require("../middleware/SocketMiddleware");
const { handleUserSession, handleMessage, handleMessagesRead, disconnectUser, handleTypingIndicator, handleStopTypingIndicator, handleFileMessage } = require("./SocketFunction");
require("dotenv").config();
const ConnectedUser = new Map()

const initalizeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin,callback)=>{
                const allowedOrigin = process.env.FRONTEND_URL.split(",").filter(Boolean);
                if(!origin || allowedOrigin.includes(origin)){
                    callback(null,true);
                }else{
                    callback(new Error("Cors Error origin not allowed."))
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE','OPTION'],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true        
        }
    });

    io.use(SocketIdMiddleware)

    io.on("connection", (socket) => {
        socket.on("error", err => console.log(err))
        handleUserSession(io, socket, ConnectedUser)
        socket.on("send_message", async(messageObject, callback) =>{
            await createChatIdOrGetChatId(socket, messageObject);
            handleMessage(io, socket, ConnectedUser, messageObject, callback);
        })
        socket.on("send_file_message", (data, callback) => handleFileMessage(io,socket,ConnectedUser,data,callback))
        socket.on("typing", (chatId) => {
            handleTypingIndicator(io, socket, chatId, ConnectedUser)
        })

        socket.on("stop_typing", (chatId) => {
            handleStopTypingIndicator(io, socket, chatId, ConnectedUser)
        })
        socket.on("messages_read", (messageIds) => handleMessagesRead(io, socket, ConnectedUser, messageIds))


        socket.on('disconnect', () => disconnectUser(io, socket, ConnectedUser))

    });

    return io;
}

module.exports = initalizeSocket