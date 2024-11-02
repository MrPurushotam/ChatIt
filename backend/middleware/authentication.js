const {verifyToken}= require("../utils/constant")

function authenticate(req,res,next){
    const cookieAuthToken=req.cookies.token
    if(!cookieAuthToken){
        return res.status(401).json({message:'User Unauthorized.',success:false})
    }
    const data=verifyToken(cookieAuthToken)
    if(data.success){
        req.userId=data.data.id
        req.username=data.data.username
        req.displayName=data.data.displayName
        req.profile=data.data.profile
        req.about=data.data.about
        return next()  
    }
    
    if(!data.success && data.jwtExpire){
        res.clearCookie("token")
        res.clearCookie("authenticate")
        return res.status(401).json({message:"Jwt Expired",success:false})
    }
    return res.status(400).json({message:"Session expired.",success:false})
}

module.exports=authenticate