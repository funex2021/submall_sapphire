const path = require('path');
const router = require('express').Router()

var passport = require('passport');
const mem = require('./mem.controller')
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

router.post("/signin", (req, res, next) => {

    let {amount} = req.body;

    console.log('req.amount : ' + amount);
    if (amount != undefined) {
        req.session.amount = amount;
    }

    passport.authenticate("local-Signin", (authError, user, info) => {
        if (authError) {
            // 에러면 에러 핸들러로 보냅니다
            console.log(authError);
            return next(authError);
        }

        if (info) {
            req.flash("alertMessage", info.message);
            return res.redirect("/login");
        }

        return req.login(user, loginError => {
            if (loginError) {
                req.flash("alertMessage", info.message);
                return res.redirect("/login");
            }

            if (req.session.amount != null && req.session.amount != undefined) {
                return res.redirect("/p/buyview")
            } else {
                return res.redirect(307, '/p/view');
            }

        });
    })(req, res, next);
});

router.post("/passSignin", (req, res, next) => {

    let {amount} = req.body;

    console.log('req.amount : ' + amount);
    if (amount != undefined) {
        req.session.amount = amount;
    }

    passport.authenticate("pass-Signin", (authError, user, info) => {
        if (authError) {
            // 에러면 에러 핸들러로 보냅니다
            console.log(authError);
            return next(authError);
        }

        if (info) {
            req.flash("alertMessage", info.message);
            return res.redirect("/login");
        }

        return req.login(user, loginError => {
            if (loginError) {
                req.flash("alertMessage", info.message);
                return res.redirect("/login");
            }

            if (req.session.amount != null && req.session.amount != undefined) {
                return res.redirect(301, "/p/buy")
            } else {
                return res.redirect(301, '/p/buy');
            }

        });
    })(req, res, next);
});

router.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

router.post('/view', isAuthenticated, mem.mview);
router.post('/ins', isAuthenticated, mem.mins);
router.post('/coin', isAuthenticated, mem.coinInfo);
router.get('/profile', isAuthenticated, mem.profile);

router.post('/signUpProc', mem.signUpProc);
router.post('/sendCertNum', mem.sendCertNum);
router.post('/checkCertNum', mem.checkCertNum);
router.post('/authSignUp', mem.authSignUp);
router.get('/authSignUp', mem.authSignUp);
router.post('/authProc', mem.authProc);
router.post('/sendAccAuth', mem.sendAccAuth);
router.post('/accAuth', mem.accAuth);

router.post('/updateInfo', isAuthenticated ,mem.updateInfo);
router.post('/updateBank', isAuthenticated , mem.updateBank);

module.exports = router;
