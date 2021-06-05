
module.exports = async (req, res, next) => {
    const { Admin } = req.session;
    res.locals.currentUser = null;
    if (Admin) {
        req.currentUser = Admin;
        res.locals.currentUser = Admin;
        next();
    } else {
        next();
    }

};