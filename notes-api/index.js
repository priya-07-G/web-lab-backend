const express = require("express");
const app = express();
app.use(express.json());

let notes = [];
let nextId = 1;

app.get("/", (req, res) => res.send("Notes API is running"));

// Create
app.post("/notes", (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title and content are required" });
  }
  const now = new Date().toISOString();
  const note = {
    id: nextId++,
    title,
    content,
    category: category || "General",
    createdAt: now,
    updatedAt: now,
  };
  notes.push(note);
  res.status(201).json(note);
});

// Read all (optional: /notes?search=word  and  /notes?category=Study)
app.get("/notes", (req, res) => {
  const { search, category } = req.query;
  let result = notes;
  if (search) {
    const word = search.toLowerCase();
    result = result.filter(
      n => n.title.toLowerCase().includes(word) || n.content.toLowerCase().includes(word)
    );
  }
  if (category) {
    result = result.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }
  res.json(result);
});

// Read one
app.get("/notes/:id", (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// Update
app.put("/notes/:id", (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: "Note not found" });
  const { title, content, category } = req.body;
  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;
  if (category !== undefined) note.category = category;
  note.updatedAt = new Date().toISOString();
  res.json(note);
});

// Delete
app.delete("/notes/:id", (req, res) => {
  const index = notes.findIndex(n => n.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Note not found" });
  notes.splice(index, 1);
  res.json({ message: "Note deleted" });
});

app.listen(3003, () => console.log("Server running on http://localhost:3003"));