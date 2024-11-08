const express = require('express');
const cors=require('cors')
// const cookiesParser= require("cookie-parser")
const UserRouter= require("./routes/userRouter");
const ChatRouter= require("./routes/ChatRouter");
const MessageRouter= require("./routes/MessagesRouter");
const { GenerousLimit } = require('./utils/RateLimitConfig');
require("dotenv").config();
const app= express()

const corsConfig= {
    origin:(origin,callback)=>{
        const allowedOrigin = process.env.FRONTEND_URL.split(",").filter(Boolean);
        if(!origin || allowedOrigin.includes(origin)){
            callback(null,true);
        }else{
            callback(new Error("Cors Error origin not allowed."))
        }
    },
    credentials: true,
    methods:  ['GET', 'POST', 'PUT', 'DELETE','OPTION'],
    allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsConfig));
// app.use(cookiesParser())
app.use(express.json())
app.use(GenerousLimit);

app.get("/",(req,res)=>{
    res.json({message:"Api is running"})
})

app.use('/api/v1/user',UserRouter)
app.use('/api/v1/message',MessageRouter)
app.use('/api/v1/chat',ChatRouter)

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

module.exports=app