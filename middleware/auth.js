const { auth } = require("../config/firebase");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = header.substring(7); 

    const decodedToken = await auth.verifyIdToken(token);

    req.user = decodedToken; 
    next();

  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

module.exports = { authenticate };