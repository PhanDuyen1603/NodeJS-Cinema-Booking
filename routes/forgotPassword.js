const Router = require('express').Router;
const router = new Router();
const sendEmail = require('../models/email');
const user = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

function Random() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for (var i = 0; i < 6; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}


// [GET] /forgotPassword
router.get('/', function (req, res) {
	res.render('auth/forgotPassword');
});

// [POST] /forgotPassword
router.post('/', async function (req, res) {
	const mail = req.body.email;
	if (mail === '') {
		res.redirect('back');
	}
	var code = Random();
	const notFoundError = 'Tài khoản không tồn tại !';
	const activateError = "Tài khoản này chưa được kích hoạt !";

	var User = await user.findOne({ where: { user_Email: mail, } });

	if (User) {
		if (User.accept_User === false) {
			res.render('auth/forgotPassword', { activateError });
		}
		else {
			user.update({
				user_Code: code,
			}
				, {
					where: {
						user_Email: mail,
					}
				});

			const info = await sendEmail(mail, '[MỘT CHÚT FILM] - [KHÔI PHỤC MẬT KHẨU]', 'content', `Mã xác thực của bạn là: <b>${code}</b>`);
			//Render trang đổi mật khẩu khi nhập mã xác thực
			res.render('auth/forgotPasswordConfirm', { user_Email: mail });
		}
	}
	else {
		res.render('auth/forgotPassword', { notFoundError });
	}
});


//[GET] /forgotPassword/confirm
router.get('/confirm', function (req, res) {
	const user_Email = '';
	res.render('auth/forgotPasswordConfirm', { user_Email });
});

//[POST] /forgotPassword/confirm
router.post('/confirm', async function (req, res) {
	const { user_Email, user_Code, user_Password, user_ConfirmPassword } = req.body;
	const invalidCode = 'Mã xác thực không chính xác';
	const invalidMail = 'Tài khoản không tồn tại';
	const invalidPassword = 'Mật khẩu không trùng khớp';

	User = await user.findOne({ where: { user_Email } });

	if (User) {
		if (User.user_Code === user_Code) {
			if (user_Password != user_ConfirmPassword) {
				res.render('auth/forgotPasswordConfirm', { user_Email, invalidPassword });
			} else {
				const hash = await bcrypt.hash(user_Password, saltRounds);

				user.update({
					user_Password: hash, user_Code: null,
				}, {
					where: { user_Email }
				});

				res.redirect('/login');
			}
		} else {
			res.render('auth/forgotPasswordConfirm', { user_Email, invalidCode });
		}
	} else {
		res.render('auth/forgotPasswordConfirm', { user_Email, invalidMail });
	}
});

router.get('/:slug', (req, res) => {
	res.render('404NotFound');
})

module.exports = router;
