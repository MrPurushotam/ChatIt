const nodemailer = require("nodemailer");

let transporterInstance = null;

class Mailer {
    constructor() {
        if (!transporterInstance) {
            transporterInstance = nodemailer.createTransport({
                host: "in-v3.mailjet.com",
                port:587,
                auth: {
                    user: process.env.NODEMAILER_MAILJET_API || "",
                    pass: process.env.NODEMAILER_MAILJET_SECRET || ""
                }
            })
        }
    }
    async sendVerificationEmail(to, verificationCode,duration=15) {
        const mailOption = {
            from: process.env.NODEMAILER_EMAIL,
            to: to,
            subject: "Email Verification",
            text: `You vefication code for chatIt is ${verificationCode} which is only valid for ${duration} minutes. If you haven't signed up then please ignore the email.`
        };
        try {
            await transporterInstance.sendMail(mailOption);
            return true;
        } catch (error) {
            console.log("Some error occured while sending verification code.", error);
            return false;
        }
    }
    async sendForgotPasswordEmail(to, resetCode,duration=15) {
        const mailOption = {
            from: process.env.NODEMAILER_EMAIL,
            to: to,
            subject: "Password Reset",
            text: `You vefication code to reset password for chatIt is ${resetCode} which is only valid for ${duration} minutes. If you haven't requested for password reset then please ignore the email.`
        };
        
        try {
            await transporterInstance.sendMail(mailOption);
            return true;
        } catch (error) {
            console.log("Some error occured while sending verification code.", error);
            return false;
        }
    }
}

module.exports= Mailer;