const Router = require('express').Router;
const router = new Router();
const sendEmail  = require('../models/email.js');
const user = require('../models/User.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
function Random() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
	for (var i = 0; i < 10; i++)
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
  }

router.get('/', function (req, res) {
	res.render('forgotPassword.ejs'); 
  });
router.post('/', async function (req, res) {   
	var macode =Random();
	var UserSaiMail = 'abc';
	const mail = req.body.email;
	var User;
	const {email } = req.body;
	User = await user.findOne({
		where: {
			user_Email:email,
		}
	});

	if(User)
	{	
		if(User.accept_User === false)
		{
			const error = "Email chưa xác nhận!";
			res.render('forgotPassword.ejs', { error });
		}
		else{
			user.update({
			
				user_Code: macode,
			}, 
			{
				where: {
					user_Email: req.body.email,
				} 
			});
			const info = await sendEmail(req.body.email, 'Quên mật khẩu', 'Bạn có quên mật khẩu', macode);
			res.render('confirm.ejs',{mail});
		}
	}

	else
	{
		res.render('forgotPassword.ejs', { UserSaiMail });
	}

  });
	
	router.get('/confirm', function (req, res) {
		res.render('confirm.ejs'); 
		});
	router.post('/confirm', async function (req, res) {  
		const codefail="a"; 
		const mail = req.body.email
		const {user_ConfirmEmail} = req.body;
		User = await user.findOne({
			where: {
							user_Email:mail,
							user_Code:user_ConfirmEmail,
			}
		});
	
		if(User)
		{
				res.render('resetPassword.ejs',{mail});
		}
		else
		{
			res.render('confirm.ejs',{mail,codefail});
		}
	
		});

router.get('/resetpassword', function (req, res) {
			res.render('resetPassword.ejs'); 
			});
router.post('/resetpassword', async function (req, res) {   
			const passfail="a";
			const mail = req.body.email
			const pass=req.body.user_Password;
			const pass1=req.body.user_ConfirmPassword;
			const hash = await bcrypt.hash(pass,saltRounds);
			var passsai="abc";
			if(pass===pass1){
				user.update({
			
					user_Password: hash,
				}, {
					where: {
						user_Email: mail,
					} 
					});
					res.redirect('/'); 
			}
			else {
				res.render('resetPassword.ejs',{mail,passsai});
			}
			});
		
		

module.exports = router;
