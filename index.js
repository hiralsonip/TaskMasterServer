const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let cors = require('cors');

require('dotenv').config();

const app = express()
const port = 3000;

// middleware for bodyparser
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors());

// Get settings
const settings = require('./config/settings');

// registering the bodyparser
app.use(bodyParser.urlencoded({ extended: true }))

// mongo db url
const db = settings.mongoDBUrl;

// Connect with database
mongoose
    .connect(db)
    .then(() => console.log('Mongo DB connected...'))
    .catch(err => console.log(err));

// Test api
const user_route = require('./routes/api/user');
app.use('/user', user_route);

const task_route = require('./routes/api/task');
app.use('/task', task_route);

const subtask_route = require('./routes/api/subtask');
app.use('/subtask', subtask_route);

const contactUs_routes = require('./routes/api/contactUs');
app.use('/contactUs', contactUs_routes);

app.get('/', (req, res) => res.send('To do list project is running'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`))