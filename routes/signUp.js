const Router = require('express').Router;
const fs = require('fs');
const user = require('../models/User');
const sendEmail = require('../models/email');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const router = new Router();

function Random() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for (var i = 0; i < 6; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

// [GET] /signup/
router.get('/', function (req, res) {
	res.render('auth/signup');
});

// [POST] /signup/
router.post('/', async function (req, res) {
	const code = Random();
	const { user_Email, user_Password, user_Name, user_NumberPhone } = req.body;
	const User = await user.findByEmail(user_Email);
	const emailError = 'Tài khoản đã tồn tại.';
	const phoneNumberError = 'Số điện thoại này đã được đăng ký.';



	if (User) {
		res.render('auth/signup', { emailError });
	} else if (user_Email === "admin@gmail.com") {
		res.render('auth/signup', { emailError });
	}
	else {
		const phoneNumber = await user.findOne({
			where: {
				user_NumberPhone: user_NumberPhone,
			}
		});
		if (phoneNumber) {
			res.render('auth/signup', { phoneNumberError });
		}
		else {
			const hashPassword = await bcrypt.hash(user_Password, saltRounds);

			await user.create({
				user_Email,
				user_Password: hashPassword,
				user_Name,
				user_NumberPhone,
				user_Address: "Chưa cập nhật",
				user_Code: code,
			}).then(async function (user) {
				const info = await sendEmail(user_Email, '[MỘT CHÚT FILM] - [XÁC THỰC TÀI KHOẢN]', 'Content', `Đây là email tự động, vui lòng không gửi mail qua địa chỉ này.\nMã xác nhận của bạn: <b>${code}</b>`);

				res.render('auth/signupConfirm', { user_Email });

			}).catch(function (err) {
				console.log(err, req.body);
			});
		};
	}
});

router.get('/confirm', function (req, res) {
	const user_Email = '';
	res.render('auth/signupConfirm', { user_Email });
});

// [POST] /signup/confirm
router.post('/confirm', async function (req, res, next) {
	const invalidCode = "Mã xác thực không chính xác";
	const invalidMail = "Tài khoản không hợp lệ";

	const user_Email = req.body.email;
	const code = req.body.code;

	user.findOne({
		where: {
			user_Email: user_Email,
		}
	})
		.then((User) => {
			if (User.user_Code === code) {
				user.update({
					accept_User: true, user_Code: null
				},
					{
						where: { user_Email: user_Email }
					}).then(() => {
						req.session.user_Id = User.user_ID;
						res.redirect('/');
					}).catch(next);
			} else {
				res.render('auth/signupConfirm', { user_Email, invalidCode });
			}
		}).catch(() => {
			res.render('auth/signupConfirm', { user_Email, invalidMail });
		});
});

router.get('/:slug', (req, res) => {
	res.render('404NotFound');
})

module.exports = router;