const path = require('path');
const router = require('express').Router()

const pay = require('./pay.controller')
var requestIp = require('request-ip');

const payUtil = require(path.join(process.cwd(), '/routes/config/common/payUtil'))

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        console.log("isAuthenticated login")
        res.redirect('/login');
    }
};

var isAuthYn = function (req, res, next) {
    if (req.user.authYn == 'Y') {
        return next();
    } else {
        res.redirect("/m/authSignUp");
    }
};

router.get('/view', isAuthenticated, isAuthYn, payUtil.isStatusCheck, pay.withdraw);
router.post('/view', isAuthenticated, isAuthYn, payUtil.isStatusCheck, pay.withdraw);
router.post('/addView', isAuthenticated, isAuthYn, pay.addWithdraw);

router.get('/airView', isAuthenticated, isAuthYn, payUtil.isStatusCheck, pay.airView);

router.get('/buyview', isAuthenticated, isAuthYn, payUtil.isStatusCheck, pay.buyview);
router.get('/buy', isAuthenticated, isAuthYn, payUtil.isStatusCheck, pay.buypage);
router.post('/buy', isAuthenticated, isAuthYn, payUtil.isStatusCheckAjax, pay.buy);

router.post('/showAccount', isAuthenticated, isAuthYn, pay.showAccount);
router.post('/selectNftBuyList', isAuthenticated, isAuthYn, pay.selectNftBuyList);
router.post('/buyCancel', isAuthenticated, isAuthYn, pay.buyCancel);

router.get('/notice', isAuthenticated, isAuthYn, pay.notice);
router.post('/notice', isAuthenticated, isAuthYn, pay.notice);

router.get('/mynft', isAuthenticated, isAuthYn, pay.mynft)




module.exports = router