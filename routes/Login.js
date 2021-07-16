const Router = require('express').Router;
const user = require('../models/User');
const router = new Router();
const bcrypt = require('bcrypt');

// [GET] /login
router.get('/', function(req, res) {
    res.render('auth/login');
});


// [POST] /login
router.post('/', async function(req, res) {
    const { txtUserEmail, txtUserPassword } = req.body;
    const loginError = 'Tên đăng nhập hoặc mật khẩu không hợp lệ !!';
    const activateError = 'Tài khoản này chưa được kích hoạt !!';

    if (txtUserEmail === "admin@gmail.com" && txtUserPassword === "1") {
        const Admin = { user_Email: txtUserEmail, user_Password: txtUserPassword, user_Name: 'Admin' };
        req.session.Admin = Admin;
        res.redirect('/admin');
    } else {
        const User = await user.findOne({ where: { user_Email: txtUserEmail, } });
        if (!User) {
            res.render('auth/login', { loginError });
        } else {
            if (User.accept_User === false) {
                res.render('auth/login', { activateError });
            } else {
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
    res.redirect('back');
});

router.post('/google-login', async(req, res) => {
    const { txtUserEmail, txtUserPassword, txtUserName } = req.body;
    var maxID = await user.max('user_ID');
    const hashPassword = await bcrypt.hash(txtUserPassword, 10);

	const found = await user.findOne({ where: { user_Email: txtUserEmail, } });
	//NẾU CHƯA ĐĂNG KÝ THÌ TẠO
	if (!found) {
		await user.create({
			user_ID: Number(maxID) + 1,
			user_Email: txtUserEmail,
			user_Name: txtUserName,
			user_NumberPhone: 'Chưa cập nhật',
			user_Password: hashPassword,
			user_Address: 'Chưa cập nhật',
		}).then((User) => {
			req.session.user_Id = User.user_ID;
		}).catch(console.error);
	} else {
		req.session.user_Id = found.user_ID;
	}

    res.redirect('/');
})

router.get('/:slug', (req, res) => {
    res.render('404NotFound');
})

module.exports = router;