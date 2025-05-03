const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();  // Load environment variables
const SECRET = process.env.JWT_SECRET;
const signin = (req, res) => {
  const { username, password } = req.body;
  if (username === "vinay" && password === "Cherishx@2025") {
    const token = jwt.sign({ username }, SECRET);
    console.log("Generated JWT Token:", token);
    res.json({ message: "Sign-in successful", token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
};
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required." });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid token." });
  }
};
module.exports = { authenticateToken, signin };





   