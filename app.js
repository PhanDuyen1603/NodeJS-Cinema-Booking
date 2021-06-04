process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require('express');
const db = require('./models/db');
const session = require('express-session');
const multer = require('multer');
const path = require('path');

// Create app 
const app = express();
const port = process.env.PORT || 3000;

// Set view engine 
app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/public', express.static('public'));
app.use(express.urlencoded({
	extended: true,
}));
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
}));
// MIDDLEWAREs
const authAdminMiddleWare = require('./middlewares/auth_admin');
app.use(authAdminMiddleWare);

//ROUTERS
const forgotPasswordRouter = require('./routes/forgotPassword');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const updateInfoRouter = require('./routes/updateInfo');
const adminRouter = require('./routes/admin');
const homeRouter = require('./routes/home');


app.use('/forgotPassword', forgotPasswordRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/updateInfo', updateInfoRouter);
app.use('/admin', adminRouter);
app.use('/', homeRouter);

//Connect database 
db.sync().then(function () {
	app.listen(port);
	console.log(`Server is listening on port ${port}`);
}).catch(function (err) {
	console.log(err);
	process.exit(1);
});
