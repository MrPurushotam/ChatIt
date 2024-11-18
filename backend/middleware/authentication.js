const {verifyToken}= require("../utils/constant")

function authenticate(req,res,next){
    const authHeader= req.headers["authorization"];
    if(!authHeader){
        return res.status(401).json({error:'User Unauthorized.No Bearer token found.',success:false})
    }
    const token = authHeader.split("Bearer ")[1]
    const data = verifyToken(token);
    if(data.success){
        req.userId=data.data.id
        req.username=data.data.username
        req.displayName=data.data.displayName
        req.profile=data.data.profile
        req.about=data.data.about
        return next()
    }
    
    if(!data.success && data.jwtExpire){
        console.log("JWT Expired")
        return res.status(400).json({error:"Jwt Expired",success:false,jwtExpired:true})
    }
    return res.status(400).json({error:"Session expired.",success:false})
}

module.exports=authenticate