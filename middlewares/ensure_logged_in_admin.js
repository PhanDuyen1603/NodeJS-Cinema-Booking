
module.exports = function ensureLoggedInAdmin(req, res, next) {
    const Admin = req.currentUser;
    if (!req.currentUser) {
        res.redirect('/login');
    }

    // KHÔNG CHO USER TRUY CẬP VÀO URL CỦA ADMIN
    if (Admin.user_Email == 'admin@gmail.com') {
        next();
    } else {
        res.redirect('/');
    }
}