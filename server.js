require("dotenv").config();
const {db} = require("./config/firebase");

const express = require("express");
const { attachStaffProfile, hasFullAccess } = require("./middleware/authorize");
const { authenticate } = require("./middleware/auth");
const cors = require("cors");
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "API is working"
    })
})

app.post("/api/feedback", async (req, res) => {

    try {
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

        const feedback = {
            submitted_at,
            parent_name,
            student_name,
            class_label,
            rating,
            rebook,
            contact_request,
            comments,
            created_at: new Date()
        };

        const docRef = await db.collection("feedback").add(feedback);

        console.log("Feedback saved:", docRef.id);

        return res.status(201).json({
            message: "Feedback received and saved",
            id: docRef.id
        });
    }catch(error){
        console.error("Error saving feedback:", error);

    return res.status(500).json({
      message: "Failed to save feedback"
    });
    }   
});

app.get("/api/feedback", authenticate, attachStaffProfile, async (req, res) => {
  const { staff } = req;

  let query = db.collection("feedback").orderBy("created_at", "desc");

  if (!hasFullAccess(staff)) {
    if (!staff.classes || staff.classes.length === 0) {
      return res.json({ feedback: [] });
    }
    query = query.where("class_label", "in", staff.classes);
  }

  const snapshot = await query.get();

  const feedback = snapshot.docs.map(doc => {
    const data = doc.data();

    if (!hasFullAccess(staff)) {
      const { parent_name, contact_request, ...safeFields } = data;
      return { id: doc.id, ...safeFields };
    }

    return { id: doc.id, ...data };
  });

  res.json({ feedback });
});

app.get("/api/me", authenticate, attachStaffProfile, (req, res) => {
  const { staff } = req; // set by attachStaffProfile

  res.json({
    name: staff.name,
    email: staff.email,
    role: staff.role,
    classes: staff.classes,
  });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})