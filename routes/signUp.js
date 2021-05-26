const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User.js');
const sendEmail  = require('../models/email.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const router = new Router();

function Random() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
	for (var i = 0; i < 10; i++)
	  text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

router.get('/',function(req,res){
	res.render('signUp.ejs');
});
router.post('/',async function(req,res){
	var text = Random();
	var {user_Email ,user_Password ,user_Name,user_NumberPhone } = req.body ;
	const User =  await user.findOne({
		where : {
			user_Email : user_Email ,
		}
	});
	if(User){
		res.render('signUp.ejs',{User});
	}
	else{
		const NumberPhone = await user.findOne({
			where :{
				user_NumberPhone : user_NumberPhone ,
			}
		});
		if(NumberPhone)
		{
			res.render('signUp.ejs',{NumberPhone});
		}
		else{
			const hash = await bcrypt.hash(user_Password,saltRounds);
			await	user.create({
						user_Email ,
						user_Password : hash,
						user_Name ,
						user_NumberPhone,
						user_Address : "chưa cập nhật",
						user_Code : text ,
					}).then(async function(user){
						const info = await sendEmail(req.body.user_Email, 'Xác nhận tài khoản', 'Đây là email tự động, vui lòng không gửi mail qua địa chỉ này.\nMã xác nhận của bạn: ' + text	);
						res.render('loginConfirm.ejs',{user_Email});
					}).catch(function(err){
						console.log(err,req.body);
					});
			};
		}
});
router.post('/confirm/',async function(req,res, next){
	const codefail="a"; 
	const user_Email = req.body.email ;
	const {user_ConfirmEmail} = req.body;
	user.findOne({
		where: {
			user_Email:user_Email,
			user_Code:user_ConfirmEmail,
		}
	}).then(function(User){
		if(User)
		{
			user.update({
				accept_User: true,
			},
			{
				where: {user_Email:user_Email,}
			}).then(function(result){
				req.session.user_Id = User.user_ID ;
				res.redirect('/');
			}).catch(next);
		}
		else
		{
			res.render('loginConfirm.ejs',{user_Email,codefail});
		}
	}).catch(function(next){
		res.render('loginConfirm.ejs',{user_Email,codefail});
	});
});

module.exports = router;
