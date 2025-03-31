const { rateLimit } = require("express-rate-limit");

const GenerousLimit = rateLimit({
    windowMs: 30 * 1000,
    max: 15,
    message: "Too many request sent. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false
})

const GenerateOtpLimit = rateLimit({
    windowMs: 50 * 1000,
    max: 10,
    message: "Please wait for a minute before trying to generate otp.",
    standardHeaders: true,
    legacyHeaders: false
})

const OtpLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: "Too many request sent. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false
})

const forgotPasswordLimit = rateLimit({
    windowMs: 24 * 60 * 1000,
    max: 3,
    message: "Too many attempts made to change password. Please try again tommrow.",
    standardHeaders: true,
    legacyHeaders: false
})


const fileUploadLimit = rateLimit({
    windowMs: 24 * 60 * 1000,
    max: 3,
    message: "Too many request sent. Please try again tommrow.",
    standardHeaders: true,
    legacyHeaders: false
})

const loginLimit = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false
})



module.exports = { GenerousLimit, OtpLimit, fileUploadLimit, loginLimit, forgotPasswordLimit, GenerateOtpLimit };