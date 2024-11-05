const {createServer}=require("http")
require('dotenv').config();

const hostip = process.env.HOST_IP || "0.0.0.0";
const app= require('./index')
const initalizeSocket= require("./socket/index")

const server= createServer(app)
initalizeSocket(server)


const PORT = process.env.PORT || 3000;

server.listen(PORT,hostip,()=>{
    console.log("Server running on localhost:3000 or "+`${hostip}`)
})