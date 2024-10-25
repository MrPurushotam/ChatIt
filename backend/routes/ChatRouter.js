const Router = require("express")
const router = Router()
const authenticate = require("../middleware/authentication")
const prisma = require("../utils/PrismaInit")
const { uploadFileToChat } = require("../middleware/multer")
const { fileUploadLimit } = require("../utils/RateLimitConfig")


router.use(authenticate)
router.get("/:start/:end", async (req, res) => {
    try {
        const { start = 0, end } = req.params
        if (end > 20) {
            return res.status(409).json({ message: "Max limit can't be greater then 20.", success: false })
        }
        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    { user1Id: req.userId },
                    { user2Id: req.userId }
                ]
            },
            skip: parseInt(start),
            take: parseInt(end),
            select: {
                id: true,
                user1Id: true,
                user2Id: true,
                lastMessage: true,
                lastMessageAt: true,
                lastMessageSenderId: true,
                unreadCount: true,
                user1: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profile: true
                    }
                },
                user2: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profile: true
                    }
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        })

        const processedChats = chats.map(chat => {
            const otherUser = chat.user1Id === req.userId ? chat.user2 : chat.user1;
            return {
                id: chat.id,
                otherUserId: otherUser.id,
                otherUserName: otherUser.username,
                otherUserDisplayName: otherUser.displayName,
                otherUserProfile: otherUser.profile,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                lastMessageSenderId: chat.lastMessageSenderId,
                unreadCount: chat.unreadCount
            };
        });

        return res.status(200).json({ message: `Chats fetched from ${start + "-" + end}`, chats: processedChats, success: true })
    } catch (error) {
        console.log("Error ", error.message)
        return res.status(500).json({ message: "Internal error occured.", success: false })
    }
})
// THOUGHT: IN route like this we should maintain a queue so that if user exits then we can keep files in queue which shall be deleted after some time or we should keep the broswer active till some sec so file get updated or we can handle the addition of file from this router itself,

// STATUS: FOr the time being we are just uploading file. So if user exists abruptly then there would be faul state where files will be uploaded but won't be actually sent.

router.post("/upload/:chatId",fileUploadLimit ,uploadFileToChat, async (req, res) => {
    try {
        const { chatId } = req.params;
        if (!chatId) {
            return res.status(400).json({ success: false, message: "ChatId is required." })
        }
        if (req.files.length < 1) {
            return res.status(400).json({ success: false, message: "No files uploaded." })
        }
        const fileDetails = [];
        req.files.forEach((file) => {
            fileDetails.push({
                fileName: file.originalname,
                fileUrl: process.env.R2_SUBDOMAIN + file.key,
                fileType: file.mimetype.split("/")[0],
                fileSize: file.size,
            })
        })
        res.status(200).json({ message: "File upload successful.", success: true, files: fileDetails });

    } catch (error) {
        console.log("Some error occured while uploading files.", error.message);
        res.status(500).json({ success: false, message: "Internal Error occured while file upload.", error: error.message });
    }
})

module.exports = router