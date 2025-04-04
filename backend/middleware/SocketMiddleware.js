// const cookie = require("cookie")
const { verifyToken } = require('../utils/constant');
const prisma = require("../utils/PrismaInit");

class CustomError extends Error {
    constructor(message, data) {
        super(message);
        this.name = this.constructor.name;
        this.data = data;
    }
}

function SocketIdMiddleware(socket, next) {

    try {
        const authHeader = socket.handshake.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new CustomError("Authentication Error", { code: 401, message: "Missing or invalid token.", tokenError: true }));
        }
        const token = authHeader.split("Bearer ")[1];
        if (!token) {
            return next(new CustomError("Authentication Error", { code: 401, message: "Token not found", tokenError: true }));
        }
        const data = verifyToken(token);
        if (data.success) {
            socket.username = data.data.username
            socket.userId = data.data.id
            socket.displayName = data.data.displayName
            socket.profile = data.data.profile
            socket.about = data.data.about
            return next()
        }
        if (!data.success && data.jwtExpire) {
            return next(new CustomError("JwtTokenExpired", { code: 401, message: "Token expired", jwtExpired: true }))
        }
        return next(new CustomError("Authentication Error", { code: 401, message: "Invalid token", tokenError: true }))
    } catch (error) {
        console.log("Error :", error.message)
        return next(new CustomError("Internal Error occured.", { code: 500, message: error.message }))
    }
}


module.exports = { SocketIdMiddleware }

