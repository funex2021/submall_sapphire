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
        console.log(requestIp.getClientIp(req))
        res.redirect('/login');
    }
};

router.get('/view', isAuthenticated, payUtil.isStatusCheck, pay.withdraw);
router.post('/view', isAuthenticated, payUtil.isStatusCheck, pay.withdraw);
router.post('/addView', isAuthenticated, pay.addWithdraw);

router.get('/buyview', isAuthenticated, payUtil.isStatusCheck, pay.buyview);
router.get('/buy', isAuthenticated, payUtil.isStatusCheck, pay.buypage);
router.post('/buy', isAuthenticated, payUtil.isStatusCheckAjax, pay.buy);

router.post('/showAccount', isAuthenticated, pay.showAccount);
router.post('/selectNftBuyList', isAuthenticated, pay.selectNftBuyList);

module.exports = router