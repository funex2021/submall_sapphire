var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser')
var fs = require("fs")
//크로스브라우져 
var cors = require('cors');

const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');
const port = properties.get('com.server.port');
const localUrl = properties.get('com.local.url');
/*
* DB config
*/
const Pool = require('./routes/config/pool');
const pool = new Pool();

global.__lib = __dirname + '/lib/';

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


app.use(express.static('public'));

app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors())
var passport = require('passport') //passport module add
const passportConfig = require('./routes/passport'); // 여기

var flash = require('connect-flash');

//secret – 쿠키를 임의로 변조하는것을 방지하기 위한 sign 값 입니다. 원하는 값을 넣으면 됩니다.
//resave – 세션을 언제나 저장할 지 (변경되지 않아도) 정하는 값입니다. express-session documentation에서는 이 값을 false 로 하는것을 권장하고 필요에 따라 true로 설정합니다.
//saveUninitialized – uninitialized 세션이란 새로 생겼지만 변경되지 않은 세션을 의미합니다. Documentation에서 이 값을 true로 설정하는것을 권장합니다.
app.use(session({
    cooke: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        expires: 7200000,
        httpOnly: true
    },
    resave: false,
    saveUninitialized: false,
    secret: 'paul!*Session'
})); // 세션 활성화

// flash는 세션을 필요로합니다. session 아래에 선언해주셔야합니다.
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passportConfig(pool);
app.set('pool', pool);

app.use(function (req, res, next) {
    if (req.user) {
        res.locals.user = req.user;
    }

    let domain = '';
    if(req.headers.host.indexOf('localhost') > -1){
        domain = localUrl;
    }else{
        domain = req.headers.host;
    }
    let obj = {}
    obj.domain = domain;
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    mydb.execute(async conn => {
        let config = await fnGetConfigInfo(obj, conn);
        if (config.is_pause == 'Y') {
            res.render("inspection");
            return;
        } else {
            if (req.isAuthenticated()) {
                console.log('login!@')
                let airdropInfo = await fnGetAirdropInfo(req.user.mSeq, conn);
                if(airdropInfo.length > 0) {
                    res.locals.airdropPrice = airdropInfo[0].price;
                } else {
                    res.locals.airdropPrice = "0";
                }
            }
            next();
        }
    });
});

/*
* config 조회
*/
function fnGetConfigInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cpc.max_amt, cpc.min_amt, cpc.is_captcha, cpc.is_pause, cpc.site_url, cpc.login_text, cpc.pwd_text, cpc.found_text, cpc.company_nm, cpc.suspension_min, cpc.is_auto_suspension_view "
        sql += " , cc.sign_yn"
        sql += " FROM cs_pay_config cpc"
        sql += " left join cs_company cc on cpc.cmpny_cd = cc.cmpny_cd"
        sql += " WHERE site_url LIKE '%" + param.domain + "%'"

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0]);
        });
    });
}

/*
* config 조회
*/
function fnGetAirdropInfo(mSeq, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select tot_price price from cs_nft_airdrop cna where m_seq = '" + mSeq + "' and use_yn = 'Y' order by create_dt desc limit 1 "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


let config = {};
app.get('/', function (req, res, next) {
    //res.redirect(307, '/p/view');
    let userId = req.query.userId;
    req.session.amount = req.query.amount;
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    mydb.execute(async conn => {
        try {
            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            let obj = {}
            obj.domain = domain;
            config = await fnGetConfigInfo(obj, conn);
            res.locals.config = config;
            let companyName = config.company_nm;
            ucompanyName = companyName.toUpperCase();
            let alertMessage = req.flash("alertMessage");
            let saveId = "";
            if(req.cookies['saveId']){
                saveId = req.cookies['saveId']
            }

            res.render("login", {
                'alertMessage': alertMessage,
                'userId': userId,
                'ucompanyName': ucompanyName,
                'companyName': companyName,
                'config': config,
                'saveId':saveId
            })
            return;
        } catch (e) {
            console.log(e.message)
        }
    });


});

app.use('/m', require('./routes/membership'))
app.use('/p', require('./routes/payment'))

app.get('/login', function (req, res, next) {
    //let domain = req.headers.host;

    if (req.isAuthenticated()) {
        return res.redirect("/p/buyview");
    }

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    mydb.executeTx(async conn => {
        try {
            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            let obj = {}
            obj.domain = domain;
            config = await fnGetConfigInfo(obj, conn);
            res.locals.config = config;
            let companyName = config.company_nm;
            ucompanyName = companyName.toUpperCase();
            let alertMessage = req.flash("alertMessage");
            let userId = "";
            let saveId = "";
            if(req.cookies['saveId']){
                saveId = req.cookies['saveId']
            }
            res.render("login", {
                'alertMessage': alertMessage,
                'userId': userId,
                'ucompanyName': ucompanyName,
                'companyName': companyName,
                'config': config,
                'saveId':saveId
            })
            return;
        } catch (e) {
            console.log(e.message)
        }
    });
});

app.get('/signUp', function (req, res, next) {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    mydb.execute(async conn => {
        try {
            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            let obj = {}
            obj.domain = domain;
            config = await fnGetConfigInfo(obj, conn);
            res.locals.config = config;

            res.render("signUp", {
                'config': config
            })
            return;
        } catch (e) {
            console.log(e.message)
        }
    });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

app.use((req, res, next) => { // 404 처리 부분
    if (req.method == 'GET') {
        res.redirect('/login')
    }

});

app.use(function (err, req, res, next) {
    res.redirect('/login')
    console.error(err.stack);
    res.status(500).render('error/500');
});

var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});

