const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf", "text/plain"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, PDF and TXT files are allowed"));
    }
    cb(null, true);
  },
});

app.get("/", (req, res) => res.send("File Upload API is running"));

// Upload one file (form field name: file)
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.status(201).json({
    message: "File uploaded",
    filename: req.file.filename,
    size: req.file.size,
    type: req.file.mimetype,
  });
});

// List files
app.get("/files", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  res.json(files);
});

// Download a file
app.get("/files/:name", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, path.basename(req.params.name));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  res.download(filePath);
});

// Delete a file
app.delete("/files/:name", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, path.basename(req.params.name));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  fs.unlinkSync(filePath);
  res.json({ message: "File deleted" });
});

// Error handler for upload problems
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large (max 2 MB)" });
  }
  res.status(400).json({ error: err.message });
});

app.listen(3004, () => console.log("Server running on http://localhost:3004"));