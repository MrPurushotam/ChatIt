
const cookie=require("cookie")
const { verifyToken } = require('../utils/constant');
const prisma = require("../utils/PrismaInit");

function SocketIdMiddleware(socket, next) {

    try {
        const cookies = socket.handshake.headers.cookie
        if (!cookies) {
            return next(new Error("Authentication Error"))
        }
        const parsedCookie = cookie.parse(cookies)
        const authToken = parsedCookie.token

        if (!authToken) {
            return next(new Error("Authentication Error"))
        }
        const data = verifyToken(authToken)
        if (data.success) {
            socket.username = data.data.username
            socket.userId = data.data.id
            socket.displayName = data.data.displayName
            socket.profile = data.data.profile
            socket.about= data.data.about
            return next()
        }
        if(!data.success && data.jwtExpire){
            return next(new Error("JwtTokenExpired"))
        }
        return next(new Error("Authentication Error"))

    } catch (error) {
        console.log("Error :", error.message)
        return next(new Error("Internal Error occured."))
    }
}

const createChatIdOrGetChatId=async(socket,data)=>{
    const { receiverId } = data;
    const senderId = socket.userId;
    let { chatId } = data;
    try {
        if (!chatId) {
            const existingChat = await prisma.chat.findFirst({
                where: {
                    OR: [
                        {
                            AND: [
                                { user1Id: senderId },
                                { user2Id: receiverId }
                            ]
                        },
                        {
                            AND: [
                                { user1Id: receiverId },
                                { user2Id: senderId }
                            ]
                        }
                    ]
                }
            });
            if(existingChat){
                data.chatId=existingChat.id;
            }else {
                const newChat = await prisma.chat.create({
                    data: {
                        user1Id: senderId,
                        user2Id: receiverId
                    }
                });
                data.chatId = newChat.id;
                socket.emit("created-chatId",  newChat.id);
            }
        }
    } catch (error) {
        console.error("Error creating chat: ", error.message);
        return next(new Error("Error creating chatId"));
    }
}


module.exports = { SocketIdMiddleware ,createChatIdOrGetChatId }

