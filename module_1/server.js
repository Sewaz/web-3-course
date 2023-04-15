const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// connect to mongoose server

mongoose.connect('mongodb://localhost:27017/students', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// model for students
const studentSchema = new mongoose.Schema({
  nickname: String,
  firstName: String,
  lastName: String
});

const Student = mongoose.model('Student', studentSchema);

// first endpoint
app.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// second endpoint
app.post('/students/token', async (req, res) => {
  const { nickname } = req.body;
  const student = await Student.findOne({ nickname });
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  const token = jwt.sign({ nickname }, 'secret-key', {expiresIn: "3h"});
  res.json({ token });
});

// third endpoint
app.post('/students', async (req, res) => {
  const { token, nickname, firstName, lastName } = req.body;
  try {
    jwt.verify(token, 'secret-key');
    const studentex = await Student.findOne({nickname})
    if (studentex){
      return res.status(402).json({message: 'Nickname already used'})
    }
    const student = new Student({ nickname, firstName, lastName });

    student.save();
    res.json(student);
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

//  start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
