const Router = require('express').Router;
const user = require('../models/User.js');
const router = new Router();
const bcrypt = require('bcrypt');

// [GET] /login
router.get('/', function (req, res) {
	res.render('auth/login');
});

// [POST] /login
router.post('/', async function (req, res) {
	const { txtUserEmail, txtUserPassword } = req.body;
	const loginError = 'Tên đăng nhập hoặc mật khẩu không hợp lệ !!';
	const activateError = 'Vui lòng kích hoạt tài khoản bằng email !!';

	if (txtUserEmail === "Admin123@gmail.com" && txtUserPassword === "123456") {
		req.session.Admin = txtUserEmail;
		res.redirect('/admin');
	}
	else {
		const User = await user.findOne({ where: { user_Email: txtUserEmail, } });
		if (!User) {
			res.render('auth/login', { loginError });
		} else {
			if (User.accept_User === false) {
				res.render('auth/login', { activateError });
			}
			else {
				const match = await bcrypt.compare(txtUserPassword, User.user_Password);
				if (match) {
					req.session.user_Id = User.user_ID;
					res.redirect('/');
				}
				if (match === false) {
					res.render('auth/login', { loginError });
				}
			}
		}

	}
});



module.exports = router;
