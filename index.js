require('dotenv').config();
const fs = require('fs');
console.log('📄 .env file contents:\n' + fs.readFileSync('.env', 'utf8'));

console.log('🔍 MONGO_URI is:', process.env.MONGO_URI);
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)


.then(() => console.log(' Connected to MongoDB'))
.catch(err => console.error(' MongoDB connection error:', err));

const express = require('express');
const cors = require('cors');
const { todos } = require('./data/todos');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// Add a new todo
app.post('/todos', (req, res) => {
  const newTodo = {
    id: todos.length + 1,
    task: req.body.task,
    done: false
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// Delete a todo by ID
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    const deleted = todos.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).json({ message: "Todo not found" });
  }
});

app.listen(PORT, () => {
  console.log(` To-Do API is running at http://localhost:${PORT}`);
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});
