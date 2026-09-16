require("dotenv").config();


const express = require("express")

const app = express();

app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        message:"API is working"
    })
})

app.post("/api/feedback", (req, res) => {

    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({
            message: "Missing authorization token"
        });
    }

    const token = authorization.replace("Bearer ", "");

    if (token !== process.env.WEBHOOK_TOKEN) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const {
        submitted_at,
        parent_name,
        student_name,
        class_label,
        rating,
        rebook,
        contact_request,
        comments
    } = req.body;

    console.log("Received feedback:", req.body);

    return res.status(201).json({
        message: "Feedback received"
    });
});

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
})