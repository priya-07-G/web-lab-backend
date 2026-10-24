const express = require("express");
const app = express();
app.use(express.json());

let todos = [];
let nextId = 1;

app.get("/", (req, res) => res.send("To-Do API is running"));

app.post("/todos", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  const todo = { id: nextId++, title, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.get("/todos", (req, res) => res.json(todos));

app.get("/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Not found" });
  res.json(todo);
});

app.put("/todos/:id", (req, res) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Not found" });
  if (req.body.title !== undefined) todo.title = req.body.title;
  if (req.body.completed !== undefined) todo.completed = req.body.completed;
  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const index = todos.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Not found" });
  todos.splice(index, 1);
  res.json({ message: "Deleted" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));