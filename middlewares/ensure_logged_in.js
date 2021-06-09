
module.exports = function ensureLoggedIn(req, res, next) {
    if (!req.currentUser) {
        res.redirect('/login');
    } else {
        next();
    }
}