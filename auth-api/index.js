const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";
const users = [];
let nextId = 1;

app.get("/", (req, res) => res.send("Auth API is running"));

// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "password must be at least 6 characters" });
  }
  if (users.some(u => u.username === username)) {
    return res.status(409).json({ error: "username already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nextId++, username, passwordHash };
  users.push(user);
  res.status(201).json({ id: user.id, username: user.username });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// Middleware to check the token
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing" });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Protected route
app.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});

app.listen(3002, () => console.log("Server running on http://localhost:3002"));