const express = require('express');
const db = require('./models/db');
const session = require('express-session');
const multer = require('multer');
const path  = require('path');

// Create app 
const app = express();
const port = process.env.PORT || 3000 ;

// Set view engine 
app.set('view engine' , 'ejs');
app.set('views','./views');
app.use('/public',express.static('public'));
app.use(express.urlencoded({
	extended: true,
  }));
  app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
  }));
  

//Router
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.use('/forgotPassword', require('./routes/forgotPassword'));
app.use('/',require('./routes/home.js'));
app.use('/login',require('./routes/Login.js'));
app.use('/signup',require('./routes/signUp.js'));
app.use('/updateInfo',require('./routes/updateInfo.js'));
app.use('/admin',require('./routes/admin.js'));

//Connect database 
db.sync().then(function(){
	app.listen(port);
	console.log(`Server is listening on port ${port}`);
}).catch(function(err){
	console.log(err);
	process.exit(1);
});
