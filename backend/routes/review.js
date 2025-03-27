const prisma = require("../utils/PrismaInit");

const router = require("express").Router();

router.post("/", async (req, res) => {
    try {
        const { subject, fullname, description } = req.body;
        let type = req.body.type;
        if (!subject || !fullname || !description) {
            return res.status(400).json({ success: false, message: "All fields are required." })
        }
        if (!type) type = "REVIEW";
        await prisma.review.create({ 
            data: { subject, description, fullname, type }
        });

        return res.status(200).json({ success: true, message: "Your message has been sent." })
    } catch (error) {
        console.log("Error occured while uploading a review detail.",error.message)
        res.status(500).json({ error, success: false, message: "Internal Error occured." })
    }
})

module.exports = router;