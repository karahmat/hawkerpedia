// DEPENDENCIES
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

// CONFIGURATION
const app = express();
const PORT = process.env.PORT;
const db = mongoose.connection;
const mongoURI = process.env.MONGO_URI;
console.log(process.env.MONGO_URI);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('The connection with mongod is established')
  })
  
// Error / success
db.on('error', (err) => console.log(err.message + ' is Mongod not running?'))
db.on('connected', () => console.log('mongo connected: ', mongoURI))
db.on('disconnected', () => console.log('mongo disconnected'))

//Set Static File
app.use(express.static('public'));

//Set Views
app.set('view engine', 'ejs');

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//Routes
const hawkerSeed = require('./controllers/hawkerSeed');
const homepage = require('./controllers/homepage');
const hawkercentre = require('./controllers/hawker');
const hawkercentreOnlySeed = require('./controllers/hawkercentreSeed');
app.use('/hawkerSeed', hawkerSeed);
app.use(homepage);
app.use('/hawkercentre', hawkercentre)
app.use('/hawkercentreOnlySeed', hawkercentreOnlySeed);

// Listen on port 3000
app.listen(PORT, () => console.info("Listening on port "+ PORT));