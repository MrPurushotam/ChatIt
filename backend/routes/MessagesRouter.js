const Router= require("express")
const router= Router()
const authenticate = require("../middleware/authentication")
const prisma=require("../utils/PrismaInit")

router.use(authenticate)
router.post("/:chatId",async(req,res)=>{
    const {chatId}=req.params
    const {start=0,end=50}=req.body
    try {
        if(!chatId){
            return res.status(200).json({message:"Start chatting today.",success:true})
        }
        const messages=await prisma.message.findMany({
            where:{
                chatId
            },orderBy:{
                sentAt:"desc"
            },
            skip:start,
            take:end,
            select:{
                id:true,
                chatId:true,
                senderId:true,
                receiverId:true,
                content:true,
                sentAt:true,
                status:true,
                attachments:{
                    select:{
                        id:true,
                        fileName:true,
                        fileSize:true,
                        fileType:true,
                        fileUrl:true
                    }
                }
            }
        })
        res.status(200).json({message:"Messages fetched successfully.",success:true,messages})
    } catch (error) {
        console.log("Error occured in messageHandler ",error.message)
        res.status(500).json({message:"Internal error occured.",success:false})
    }
})






module.exports = router