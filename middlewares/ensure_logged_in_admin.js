
module.exports = function ensureLoggedInAdmin(req, res, next) {
    if (!req.currentUser) {
        res.redirect('/login');
    } else {
        next();
    }
}