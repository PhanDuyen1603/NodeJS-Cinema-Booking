const User = require('../models/user');

module.exports = async (req, res, next) => {

    //CHO PHÉP ĐANG ĐĂNG NHẬP ADMIN VẪN ĐĂNG NHẬP MỘT USER KHÁC ĐƯỢC ĐƯỢC 
    const { Admin, user_Id } = req.session;

    res.locals.currentUser = null;

    if (Admin) {
        req.currentUser = Admin;
        res.locals.currentUser = Admin;
    }

    //User ưu tiên hiển thị hơn
    if (user_Id) {
        const user = await User.findByPk(user_Id);
        if (user) {
            req.currentUser = user;
            res.locals.currentUser = user;
        }
    }
    next();
};