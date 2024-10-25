const {createServer}=require("http")
require('dotenv').config();

const app= require('./index')
const initalizeSocket= require("./socket/index")

const server= createServer(app)
initalizeSocket(server)


const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{
    console.log("Server running on 3000")
})