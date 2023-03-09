const path = require('path');
const router = require('express').Router()

const pay = require('./pay.controller')
var requestIp = require('request-ip');

const payUtil = require(path.join(process.cwd(), '/routes/config/common/payUtil'))
const exchangeUtil = require(path.join(process.cwd(), '/routes/services/exchangeUtil'))

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
router.post('/airAddView', isAuthenticated, isAuthYn, pay.airAddView);

router.get('/buyview', isAuthenticated, isAuthYn, payUtil.isStatusCheck, exchangeUtil.fnGetExchangeRate, pay.buyview);
router.get('/buy', isAuthenticated, isAuthYn, payUtil.isStatusCheck, pay.buypage);
router.post('/buy', isAuthenticated, isAuthYn, payUtil.isStatusCheckAjax, pay.buy);
router.post('/sell', isAuthenticated, isAuthYn, payUtil.isStatusCheckAjax, pay.sell);

router.post('/showAccount', isAuthenticated, isAuthYn, pay.showAccount);
router.post('/selectNftBuyList', isAuthenticated, isAuthYn, pay.selectNftBuyList);
router.post('/buyCancel', isAuthenticated, isAuthYn, pay.buyCancel);

router.get('/notice', isAuthenticated, isAuthYn, pay.notice);
router.post('/notice', isAuthenticated, isAuthYn, pay.notice);

router.get('/mynft', isAuthenticated, isAuthYn, pay.mynft)

router.get('/haveNft', isAuthenticated, isAuthYn, pay.haveNft);
router.post('/haveNft', isAuthenticated, isAuthYn, pay.haveNft);



module.exports = router