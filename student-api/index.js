const express = require("express");
const app = express();
app.use(express.json());

let students = [];
let nextId = 1;

app.get("/", (req, res) => res.send("Student Records API is running"));

// Create
app.post("/students", (req, res) => {
  const { name, rollNo, department, cgpa } = req.body;
  if (!name || !rollNo || !department || cgpa === undefined) {
    return res.status(400).json({ error: "name, rollNo, department and cgpa are required" });
  }
  if (cgpa < 0 || cgpa > 10) {
    return res.status(400).json({ error: "cgpa must be between 0 and 10" });
  }
  if (students.some(s => s.rollNo === rollNo)) {
    return res.status(409).json({ error: "rollNo already exists" });
  }
  const student = { id: nextId++, name, rollNo, department, cgpa };
  students.push(student);
  res.status(201).json(student);
});

// Read all (optional filter: /students?department=CSE)
app.get("/students", (req, res) => {
  const { department } = req.query;
  if (department) {
    return res.json(students.filter(s => s.department === department));
  }
  res.json(students);
});

// Read one
app.get("/students/:id", (req, res) => {
  const student = students.find(s => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

// Update
app.put("/students/:id", (req, res) => {
  const student = students.find(s => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: "Student not found" });
  const { name, rollNo, department, cgpa } = req.body;
  if (name !== undefined) student.name = name;
  if (rollNo !== undefined) student.rollNo = rollNo;
  if (department !== undefined) student.department = department;
  if (cgpa !== undefined) student.cgpa = cgpa;
  res.json(student);
});

// Delete
app.delete("/students/:id", (req, res) => {
  const index = students.findIndex(s => s.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Student not found" });
  students.splice(index, 1);
  res.json({ message: "Student deleted" });
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));