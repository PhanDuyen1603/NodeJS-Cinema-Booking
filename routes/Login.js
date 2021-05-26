const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const router = new Router();
const signup = require('./signUp.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;



router.get('/',function(req,res){
	res.render('Login.ejs');
});

router.post('/',async function(req,res){
	var { txtUserEmail , txtUserPassword } =req.body;
	var UserSaiPass = 'abc';
	if(txtUserEmail === "Admin123@gmail.com" && txtUserPassword ==="123456"){
		req.session.Admin = txtUserEmail;
		res.redirect('/admin');
	}
	else {
		const User = await user.findOne({
			where: {
				user_Email: txtUserEmail,
			}
		});
		if (!User) {
			console.log('password sai');
			res.render('Login.ejs', { UserSaiPass });
		}
		else if(User.accept_User === false){
			const error = "Vui long xac nhan email!";
			res.render('Login.ejs', {error});
		}
		else {
			const match = await bcrypt.compare(txtUserPassword, User.user_Password);
			if (match) {
				console.log('da login');
				req.session.user_Id = User.user_ID;
				res.redirect('/');
			}
			if (match == false) {
				res.render('Login.ejs', { UserSaiPass });
			}
		}
	}
});

	

module.exports = router;
