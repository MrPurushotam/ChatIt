const { Server } = require("socket.io")
const { SocketIdMiddleware, createChatIdOrGetChatId } = require("../middleware/SocketMiddleware");
const { handleUserSession, handleMessage, handleMessagesRead, disconnectUser, handleTypingIndicator, handleStopTypingIndicator, handleFileMessage } = require("./SocketFunction");
const { socketFileUpload } = require("../middleware/multer");

const ConnectedUser = new Map()

const initalizeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: '*',
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