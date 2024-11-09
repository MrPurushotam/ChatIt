const multer= require("multer");
const multerS3= require("multer-s3");
const r2= require("../utils/CloudfalreConfig");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");

require("dotenv").config();

const allowedImageTypes= ["image/jpg","image/jpeg","image/png","image/webp"]
const ProfileUploadConfig = multer({
  limits: {
    fileSize: 4 * 1024 * 1024 // 4MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
  storage: multerS3({
    s3: r2,
    bucket: process.env.BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `profile/U${req.userId}-${Date.now()}`);
    }
  })
});

const ProfileUpload = (req, res, next) => {
  try {
    ProfileUploadConfig.single("profile")(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size limit exceeded. Maximum size is 4MB.' });
        }
        if (err.message.startsWith('Invalid file type')) {
          return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'File upload failed.', details: err.message });
      }
  
      if (req.file && req.profile) {
        try {
          const key = "profile"+ req.profile.split("/profile")[1];
          const deleteParams = {
            Bucket: process.env.BUCKET,
            Key: key,
          };
          const command = new DeleteObjectCommand(deleteParams);
          await r2.send(command); 
          console.log('Old profile deleted successfully');
        } catch (deleteErr) {
          console.error("Error deleting old profile:", deleteErr);
        }
      }
  
      next();
    });
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    res.status(500).json({ error: 'An unexpected error occurred during file upload.', details: e.message });
  }
};  

const fileSizeLimits = {
  image: 3 * 1024 * 1024,  
  video: 30 * 1024 * 1024,
  audio: 3 * 1024 * 1024,
  other: 5 * 1024 * 1024 
};

const fileUploadConfig= multer({
  storage:multerS3({
    s3:r2,
    bucket: process.env.BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const chatId= req.params.chatId
      if (!chatId) {
        return cb(new Error('Chat ID is required'), false);
      }
      const fileUrl= `chat_attachments/chat-${chatId}/U${req.userId}-${Date.now()}`
      cb(null, fileUrl);
    }
  }),
  limits:{
    fileSize:(file)=>{
      if(file.mimetype.startsWith("image/")){
        return fileSizeLimits.image;
      }
      if(file.mimetype.startsWith("video/")){
        return fileSizeLimits.video;
      }
      if(file.mimetype.startsWith("audio/")){
        return fileSizeLimits.video;
      }
      return  fileSizeLimits.other;
    }
  },
  fileFilter:(req,file,cb)=>{
    const fileType= file.mimetype;
    if(fileType.startsWith("image/") || fileType.startsWith("video/") || fileType.startsWith("application/") || fileType.startsWith("audio/")){
      cb(null,true);
    }else{
      cb(new Error("Invalid file type."),false);
    }
  }
})

const uploadFileToChat=(req,res,next)=>{
  fileUploadConfig.array("file",4)(req,res,err=>{
    if(err instanceof multer.MulterError){
      console.log("Multer error during file upload:", err.message)
      return res.status(400).json({success:false,message:"File upload failed.",error:err.message})
    }else if(err){
      console.log("unknown error occured while uplaoding file.",err.message);
      return res.status(500).json({ success: false, message: 'File upload failed', error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }
    next();
  })
}

module.exports={ProfileUpload , uploadFileToChat}