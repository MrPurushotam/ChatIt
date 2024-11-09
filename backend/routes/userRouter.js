const Router = require("express")
const bcrypt = require("bcryptjs")
const path = require("path")
const crypto = require('crypto');
const { createToken } = require("../utils/constant")
const authenticate = require("../middleware/authentication")
const prisma = require("../utils/PrismaInit")
const { ProfileUpload } = require("../middleware/multer")
const { storeVerificationCode, storeForgotPasswordCode, validateForgotPasswordCode, validateVerificationCode, deleteCodePostUpdate } = require("../utils/verifyCode");
const Mailer = require("../utils/EmailService");
const { loginLimit, OtpLimit, forgotPasswordLimit } = require("../utils/RateLimitConfig");
const router = Router();
const verificationCodeMap = new Map();
const forgotPasswordCodeMap = new Map();

router.post('/login',loginLimit, async (req, res) => {
    try {
        const { email, password } = req.body
        if (!(email?.trim()) || !(password?.trim())) {
            return res.status(400).json({ message: "Invalid data sent.", success: false })
        }
        const user = await prisma.user.findUnique({
            where: {
                email: email.trim()
            }
        })
        if (!user) {
            return res.status(401).json({ message: "User doesn't exists.", success: false })
        }
        const CorrectPassword = await bcrypt.compare(password.trim(), user.password)
        if (!CorrectPassword) {
            return res.status(400).json({ message: "Incorrect passowrd.", success: false })
        }
        const token = createToken({ id: user.id, username: user.username, displayName: user.displayName, profile: user.profile, about: user.about , isVerified:user.isVerified })
        // res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production',maxAge: 259200000 ,sameSite:"none"})
        // res.cookie("authenticate", true, {httpOnly:false,secure:process.env.NODE_ENV === 'production',maxAge: 259200000,sameSite:"none"})
        res.status(200).json({ message: "Logged in.", success: true ,token})
    } catch (error) {
        console.log("Error ", error.message)
        return res.status(500).json({ message: "Internal error occured.", success: false })
    }
})

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const username = (req.body.username[0].toUpperCase() + req.body.username.substring(1).toLowerCase());
        if (!email?.trim() || !password?.trim() || !username?.trim()) {
            return res.status(400).json({ message: "Invalid data sent.", success: false });
        }
        if (username.length < 6) {
            return res.status(400).json({ messaage: "Username should be greater then 5 letters.", success: false });
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.trim() },
                    { username: username.trim() }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exits.", success: false })
        }
        const newUser = await prisma.user.create({
            data: {
                email: email.trim(),
                password: await bcrypt.hash(password.trim(), 10),
                username: username.trim(),
                displayName: username.trim()
            }
        });
        const token = createToken({ id: newUser.id, username: newUser.username, displayName: newUser.displayName, profile: newUser.profile, about: newUser.about ,isVerified:newUser.isVerified})
        // res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production',maxAge: 259200000 ,sameSite:"none"})
        // res.cookie("authenticate", true, {httpOnly:false,secure:process.env.NODE_ENV === 'production',maxAge: 259200000,sameSite:"none"})
        // Create verification token
        const verificationCode = crypto.randomInt(Math.pow(10, 6 - 1), Math.pow(10, 6));
        storeVerificationCode(verificationCodeMap, email, verificationCode);
        // send token over mail
        const mailer = new Mailer();
        const emailSent = await mailer.sendVerificationEmail(email, verificationCode, duration = 15);
        let additionalResponseObject={}
        if (!emailSent) {
            additionalResponseObject.emailError=true;
            additionalResponseObject.emailErrorMessage="Some error occured while sending email.";
        }
        res.status(200).json({ message: "User created.", success: true ,...additionalResponseObject,token })
    } catch (error) {
        console.log("Error ", error.message)
        return res.status(500).json({ message: "Internal error occured.", success: false })
    }
})


router.post("/forgotpassword",forgotPasswordLimit, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required.", success: false });
        }
        const existingUser = await prisma.user.findFirst({
            where: { email }
        })
        if (!existingUser) {
            return res.status(400).json({ message: "User doesn't exists.", success: false })
        }

        const verificationCode = crypto.randomInt(Math.pow(10, 6 - 1), Math.pow(10, 6));
        storeForgotPasswordCode(forgotPasswordCodeMap, email, verificationCode);
        const mailer = new Mailer();
        const emailSent = await mailer.sendForgotPasswordEmail(email, verificationCode, duration = 15);
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email.", success: false });
        }
        return res.status(200).json({ message: "Password reset code sent.", success: true });
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false, error: error });
    }
})

router.post('/verifypassword', async (req, res) => {
    const { email, password, code } = req.body
    try {
        if (!email) {
            return res.status(400).json({ message: "Email can't be empty.", success: false })
        }
        if (!code) {
            return res.status(400).json({ message: "Verification code can't be empty.", success: false })
        }
        if (!/^\d+$/.test(parseInt(code))) {
            return { success: false, message: "Verification code must be a number." };
        }
        if (!password) {
            return res.status(400).json({ message: "New Password can't be empty.", success: false })
        }

        const status = validateForgotPasswordCode(forgotPasswordCodeMap, email, parseInt(code));
        if (status.success) {
            const hashedPassword = await bcrypt.hash(password.trim(), 10)
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            })
            deleteCodePostUpdate(forgotPasswordCodeMap, email);
            return res.status(200).json({ success: true, message: "New password updated." })
        } else {
            return res.status(400).json(status)
        }

    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false, error: error });
    }
})


router.use(authenticate)

router.get("/logout", (req, res) => {
    // res.clearCookie("token")
    // res.clearCookie("authenticate")
    res.status(200).json({ message: "Logged out.", success: true })
})

router.get("/", async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId
            }, select: {
                id: true,
                email:true,
                isVerified: true,
                lastOnline: true,
                profile: true,
                username: true,
                displayName: true,
                about: true
            }
        })

        res.status(200).json({ user, success: true })

    } catch (error) {
        console.log("Error ", error.message)
        return res.status(500).json({ message: "Internal error occured.", success: false })
    }
})

router.get("/search/:query?", async (req, res) => {
    try {
        const query = req.params.query?.trim();
        const currentUserId = req.userId;
        let users;
        if (query) {
            // Find all users matching the search query
            users = await prisma.user.findMany({
                where: {
                    OR: [
                        {
                            username: {
                                contains: query,
                                mode: "insensitive"
                            }
                        },
                        {
                            displayName: {
                                contains: query,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    username: true,
                    displayName: true,
                    id: true,
                    lastOnline: true,
                    profile: true,
                    chatsAsUser1: {
                        where: {
                            user2Id: currentUserId
                        },
                        select: {
                            lastMessage: true,
                            lastMessageAt: true,
                            id: true
                        }
                    },
                    chatsAsUser2: {
                        where: {
                            user1Id: currentUserId
                        },
                        select: {
                            lastMessage: true,
                            lastMessageAt: true,
                            id: true
                        }
                    }
                }
            });
        } else {
            // If no query, show recent users
            users = await prisma.user.findMany({
                where: {
                    OR: [
                        {
                            chatsAsUser1: {
                                some: {
                                    user2Id: currentUserId
                                }
                            }
                        },
                        {
                            chatsAsUser2: {
                                some: {
                                    user1Id: currentUserId
                                }
                            }
                        }
                    ]
                },
                orderBy: {
                    lastOnline: 'desc'
                },
                select: {
                    username: true,
                    displayName: true,
                    id: true,
                    lastOnline: true,
                    profile: true,
                    chatsAsUser1: {
                        where: {
                            user2Id: currentUserId
                        },
                        select: {
                            lastMessage: true,
                            lastMessageAt: true,
                            id: true
                        }
                    },
                    chatsAsUser2: {
                        where: {
                            user1Id: currentUserId
                        },
                        select: {
                            lastMessage: true,
                            lastMessageAt: true,
                            id: true
                        }
                    }
                },
                take: 10
            });
        }

        const transformedUsers = users.map((user) => {
            // Check if there's an existing chat
            const chatAsUser1 = user.chatsAsUser1[0];
            const chatAsUser2 = user.chatsAsUser2[0];
            const existingChat = chatAsUser1 || chatAsUser2;

            return {
                otherUserName: user.username,
                otherUserDisplayName: user.displayName,
                otherUserId: user.id,
                otherUserProfile: user.profile,
                otherUserLastOnline: user.lastOnline,
                lastMessage: existingChat?.lastMessage || null,
                lastMessageAt: existingChat?.lastMessageAt || null,
                id: existingChat?.id,
                hasChat: !!existingChat,
            };
        });
        const sortedUsers = query ?
            transformedUsers.sort((a, b) => {
                if (a.hasChat && !b.hasChat) return -1;
                if (!a.hasChat && b.hasChat) return 1;
                if (a.hasChat && b.hasChat) {
                    return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
                }
                return new Date(b.otherUserLastOnline) - new Date(a.otherUserLastOnline);
            }) :
            transformedUsers.sort((a, b) =>
                new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
            );

        res.status(200).json({ message: "Users fetched.", users: sortedUsers, success: true });
    } catch (error) {
        console.log("Error ", error);
        return res.status(500).json({ message: "Internal error occurred.", success: false, error: error.messaage });
    }
});

router.post("/profile", ProfileUpload, async (req, res) => {
    try {
        const { displayName, about } = req.body;
        if (!req.file && !displayName && !about) {
            return res.status(400).json({ message: "Fileds can't be empty.", success: false });
        }
        const updatedData = {};
        if (displayName) updatedData.displayName = displayName;
        if (about) updatedData.about = about;
        if (req.file) updatedData.profile = process.env.R2_SUBDOMAIN + req.file.key;

        await prisma.user.update({
            where: { id: req.userId },
            data: updatedData,
        })
        res.status(200).json({ message: "Updated", success: true, updatedField: updatedData })

    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false });
    }
})

router.post("/verify",OtpLimit, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required.", success: false });
        }
        const existingUser = await prisma.user.findFirst({
            where: { email }
        })
        if (!existingUser) {
            return res.status(400).json({ message: "User doesn't exists.", success: false })
        }
        const verificationCode = crypto.randomInt(Math.pow(10, 6 - 1), Math.pow(10, 6));
        storeVerificationCode(verificationCodeMap, email, verificationCode);
        const mailer = new Mailer();
        const emailSent = await mailer.sendVerificationEmail(email, verificationCode, duration = 15);
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email.", success: false });
        }
        return res.status(200).json({ message: "Verification email sent.", success: true });
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false, error: error });
    }
})

router.post("/verifyemail", async (req, res) => {
    try {
        const { email, code } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email can't be empty.", success: false })
        }
        if (!code) {
            return res.status(400).json({ message: "Verification code can't be empty.", success: false })
        }
        if (!/^\d+$/.test(parseInt(code))) {
            return res.status(400).json({ message: "Verification code must be a number.", success: false })
        }
        const status = validateVerificationCode(verificationCodeMap, email, parseInt(code));
        if (status.success) {
            await prisma.user.update({
                where: { email },
                data: { isVerified: true }
            })
            deleteCodePostUpdate(verificationCodeMap, email);
            return res.status(200).json({ ...status });
        } else {
            return res.status(400).json({ ...status });
        }
    } catch (error) {
        console.log("Error ", error.message);
        return res.status(500).json({ message: "Internal error occurred.", success: false, error: error });

    }
})


module.exports = router