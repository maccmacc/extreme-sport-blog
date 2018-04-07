const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config=require('./config/database');
const blogs=require('./routes/blogs');

mongoose.connect(config.database);

mongoose.connection.on('connected',()=>{
    console.log('connected to database'+config.database);
});

mongoose.connection.on('error',(err)=>{
    console.log('connect to database failed'+err);
});
const app=express();

const users=require('./routes/users');


const port=8080;

app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use('/blogs',blogs);
//passport
app.use(passport.initialize());
app.use(passport.session());



app.use('/users',users);
// Index Route
app.get('/', (req, res) => {
    res.send('Invalid Endpoint');
});
// Start Server
app.listen(port, () => {
    console.log('Server started on port '+port);
});

