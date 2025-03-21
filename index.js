const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
require('dotenv').config()

// get user model
const User = require('./models/User');
// get exercise model
const Exercise = require('./models/Exercise');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// connect to database
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

// create new user
app.post('/api/users', urlencodedParser, async (req, res) => {
  //get username from request body
  const { username } = req.body;

  // create new user
  const user = new User({ username });
  await user.save();
  res.json(user);
});

// add exercise to user
app.post('/api/users/:_id/exercises', urlencodedParser, async (req, res) => {
  // get request params
  const { _id } = req.params; 
  const { description, duration, date } = req.body;

  // get user by id
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // create new exercise 
    const exercise = new Exercise({ user, description, duration, date });
    await exercise.save();

    // return response
    res.json({
      _id: user._id,
      username: user.username,
      date: exercise.date.toDateString(), 
      duration: exercise.duration,
      description: exercise.description
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get all users
app.get('/api/users', async (req, res) => {
  // get all users
  const users = await User.find();
  res.json(users);
});

// get user's exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  // get user id from request parameters
  const { _id } = req.params;
  // get from and to query parameters
  const { from, to } = req.query;
  // get limit query parameter
  const limit = parseInt(req.query.limit);

  // get user
  const user = await User.findById(_id);
  // get user's exercises
  let exercises = await Exercise.find({ user });

  // filter exercises by date range
  if (from) {
    const fromDate = new Date(from);
    exercises = exercises.filter(exercise => exercise.date >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    exercises = exercises.filter(exercise => exercise.date <= toDate);
  }

  // limit exercises
  if (limit) {
    exercises = exercises.slice(0, limit);
  }

  // add count property to exercises
  const count = exercises.length;

  // dirty!
  exercises = exercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString()
  }));

  // return response
  res.json({ _id, username: user.username, count, log: exercises });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
