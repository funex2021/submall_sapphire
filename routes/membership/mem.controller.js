const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./mem.sqlmap'); // 여기
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encryption = require(path.join(process.cwd(), '/routes/services/encUtil'));
const CONSTS = require(path.join(process.cwd(), '/routes/services/const'));
const smsUtil = require(path.join(process.cwd(), "/routes/services/smsUtil"));
const axios = require('axios')

const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');
const cooconUrl = properties.get('com.coocon.url');
const localUrl = properties.get('com.local.url');

const {v4: uuidv4} = require('uuid');


exports.profile = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let userId = req.user.memId;
            let cmpnyCd = req.user.cmpnyCd;
            let cmpnyInfo = null;
            let obj = {};
   
            try {
                obj.cmpnyCd = cmpnyCd;
                obj.memId = userId;
                memInfo = await Query.QGetMemberInfo(obj, conn);
                console.log()
                let domain = '';
                if(req.headers.host.indexOf('localhost') > -1){
                    domain = localUrl;
                }else{
                    domain = req.headers.host;
                }
                obj.domain = domain;
                let config = await Query.QGetConfigInfo(obj, conn);
                res.render("profile", {
                    'config': config,
                    'memInfo': memInfo[0],
                    userId,
                    "menuNum":4
                })
            } catch (e) {
                console.log(e)
                obj.user_id = req.user.memId
                //res.redirect("p/buyview")
                next(e);
            }
        } catch (e) {
            console.log(e)
            next(e);
        }
    });
}

exports.mview = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {srchOption, srchText, pageIndex} = req.body;

    let search = {};
    search.option = srchOption;
    if (srchOption == "") search.text = "";
    else search.text = srchText;

    let obj = {};

    obj.mainAdmin = false;
    obj.memId = "";
    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.srchOption = srchOption;
    obj.text = srchText;

    mydb.execute(async conn => {
        try {

            let totalPageCount = await Query.QGetMemTotal(obj, conn);

            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;

            let pagination = {};
            pagination.rowsPerPage = 20;//페이지당 게시물 수
            pagination.totalItems = 0;//전체 게시물 숫자
            pagination.pageListSize = 5;//페이지 숫자 버튼 개수
            pagination.pageIndex = pageIndex//현재페이지
            pagination.totalPage = Math.ceil(totalPageCount.totSum / parseInt(pagination.rowsPerPage));  //전체 페이지 수
            pagination.totalSet = Math.ceil(pagination.totalPage / pagination.pageListSize);    //전체 세트수
            pagination.curSet = Math.ceil(pageIndex / pagination.pageListSize) // 현재 셋트 번호
            pagination.startPage = ((pageIndex - 1) * pagination.pageListSize) + 1 //현재 세트내 출력될 시작 페이지;
            pagination.endPage = (pagination.startPage + pagination.pageListSize) - 1; //현재 세트내 출력될 마지막 페이지;
            logUtil.logObj(" 회원 리스트 pagination ", pagination)

            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            let memList = await Query.QGetMemberList(obj, conn);

            let basicInfo = {}
            basicInfo.title = '회원 관리';
            basicInfo.menu = 'MENU00000000000004';
            basicInfo.rtnUrl = 'membership/index';
            basicInfo.memList = memList;
            basicInfo.search = search;
            basicInfo.pagination = pagination;

            req.basicInfo = basicInfo;

            next();
        } catch (e) {
            logUtil.errObj("lecture.controller view", e)
            next(e);
        }
    });
}

exports.mins = async (req, res, next) => {
    let {
        mSeq,
        memId,
        memName,
        memPW1,
        memHp,
        bankInfo,
        memNation,
        bankAcc,
        accNm
    } = req.body;

    let tronInfo = await tron.newAddress();

    let obj = {};

    obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd;
    obj.memId = memId;

    obj.memNm = memName;
    obj.memHp = memHp;
    obj.nation = memNation;
    obj.bankInfo = bankInfo;
    obj.bankAcc = bankAcc;
    obj.accNm = accNm;
    obj.coinTyp = 'CMDT00000000000018';
    obj.cmpnyAddr = tronInfo.address;
    obj.cmpnyPk = tronInfo.privateKey;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            if (mSeq == '') {
                obj.mSeq = uuidv4();
                let passInfo = await encryption.createPasswordHash(Buffer.from(memPW1, "base64").toString('utf8'));
                obj.memPass = passInfo.password;
                obj.salt = passInfo.salt;

                await Query.QSetMember(obj, conn);
                conn.commit();
                await Query.QSetWallet(obj, conn);
                conn.commit();
                await Query.QSetBank(obj, conn);
                conn.commit();
            } else {
                //update
                obj.mSeq = mSeq;
                if (memPW1 != '') {
                    obj.memPass = passInfo.password;
                    obj.salt = passInfo.salt;
                }

                await Query.QUptMember(obj, conn);
                await Query.QUptBank(obj, conn);
            }


            conn.commit();
            res.json(rtnUtil.successTrue("", ""));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("회원 등록", e)
            res.json(rtnUtil.successFalse("", ""));
        }
    });
}

exports.coinInfo = async (req, res, next) => {
    let {mSeq} = req.body;

    let obj = {};
    obj.mSeq = mSeq;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let coinInfo = await Query.QGetWallet(obj, conn);
            let unitCoinInfo = {};
            unitCoinInfo.address = coinInfo[0].coin_addr;
            let start = new Date().getTime();

            let tronInfo = await axios.get(CONSTS.API.URL + '/public/balance/' + coinInfo[0].coin_addr);

            unitCoinInfo.coin = tronInfo.data.data.coin;
            unitCoinInfo.token = tronInfo.data.data.token;
            let elapsed = new Date().getTime() - start;
            console.log("coin 시간 측정 ::::", elapsed)
            let coinHistory = await Query.QGetCoinBuyList(obj, conn);

            res.json(rtnUtil.successTrue("", {'coinInfo': unitCoinInfo, 'coinHistory': coinHistory}));

        } catch (e) {
            conn.rollback();
            logUtil.errObj("회원 등록", e)
            res.json(rtnUtil.successFalse("", ""));
        }
    });
}

exports.signUpProc = async (req, res, next) => {
    let {id, email, password, name, acc_nm, bank_nm, bank_code, bank_acc, hp, seq} = req.body;

    let obj = {};
    obj.memId = id;

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
            obj.domain = domain;
            let config = await Query.QGetConfig(obj, conn);
            obj.cmpnyCd = config.cmpny_cd;

            let memInfo = await Query.QGetMemberInfo(obj, conn);
            if (memInfo.length > 0) {
                res.json(rtnUtil.successFalse('500', '존재하는 회원 id 입니다.'));
                return;
            }


            try {
                let createWallet = await axios.get(CONSTS.API.URL + '/v1/api/blockchain/createWallet');
                if (createWallet.data.success) {
                    obj.cmpnyAddr = createWallet.data.data.address;
                    obj.cmpnyPk = createWallet.data.data.privateKey;
                    // obj.key_id = createWallet.data.data.keyId;
                    // obj.krn = createWallet.data.data.krn;
                    // obj.public_key = createWallet.data.data.publicKey;
                } else {
                    return res.json(rtnUtil.successFalse("500", "회원가입이 실패했습니다.","",""));
                }
            }catch (e){
                console.log('error ' , e);
                return res.json(rtnUtil.successFalse("500", "회원가입이 실패했습니다.","",""));
            }

            obj.mSeq = uuidv4();
            let passInfo = await encryption.createPasswordHash(password);
            obj.memPass = passInfo.password;
            obj.salt = passInfo.salt;

            obj.memNm = name;
            obj.memHp = hp;
            obj.memEmail = email;
            obj.nation = '82';
            obj.nftStatus = 'CMDT00000000000076';
            obj.authYn = 'Y';
            await Query.QSetMember(obj, conn);

            obj.coinTyp = 'CMDT00000000000078';
            let wallet = await Query.QSetWallet(obj, conn);
            obj.walletSeq = wallet.insertId;

            obj.bankInfo = '';
            obj.bankAcc = '';
            obj.accNm = '';
            obj.bank_code = '';
            await Query.QSetBank(obj, conn);

            await Query.QSetBalance(obj, conn);

            await Query.QSetNftCollection(obj, conn);

            obj.kycYn = 'N';
            await Query.QSetNftKcy(obj, conn);

            await Query.QSetCreater(obj, conn);

            conn.commit();

            res.json(rtnUtil.successTrue("회원가입되었습니다."));
        } catch (e) {
            res.json(rtnUtil.successFalse("500", "회원가입이 실패했습니다.","",""));
        }
    });
}

exports.sendCertNum = async (req, res, next) => {
    let {hp} = req.body;

    let obj = {};
    obj.hp = hp;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let str = '';
            for (let i = 0; i < 6; i++) {
                str += Math.floor(Math.random() * 10)
            }

            obj.auth_code = str;
            obj.auth_yn = 'N';

            let certNum = await Query.QInsCertNum(obj, conn);
            obj.seq = certNum.insertId;

            let data = {};
            data.recipients = hp;
            data.message = '인증번호는 ['+str+'] 입니다.';

            let sms = await smsUtil.fnSmsApiCall(data);

            conn.commit();

            res.json(rtnUtil.successTrue("전송되었습니다.", obj));
        } catch (e) {
            console.log(e)
            res.json(rtnUtil.successFalse("500", "안증번호 전송이 실패했습니다.","",""));
        }
    });
}

exports.checkCertNum = async (req, res, next) => {
    let {seq, cert_num} = req.body;

    let obj = {};
    obj.seq = seq;
    obj.cert_num = cert_num;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            //인증번호확인
            let cert = await Query.QGetCertNum(obj, conn);
            if (cert.auth_code == cert_num) {
                obj.auth_yn = 'Y';
                await Query.QUptCertYn(obj, conn);

                conn.commit();

                res.json(rtnUtil.successTrue("인증되었습니다.", obj));
            } else {
                res.json(rtnUtil.successFalse("500", "안증번호 확인이 실패했습니다.","",""));
                return;
            }
        } catch (e) {
            console.log(e)
            res.json(rtnUtil.successFalse("500", "안증번호 전송이 실패했습니다.","",""));
        }
    });
}


exports.authSignUp = async (req, res, next) => {
    let obj = {};

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
            obj.domain = domain;
            let config = await Query.QGetConfig(obj, conn);

            //해당 회원 조회
            obj.memId = req.user.memId;
            obj.cmpnyCd = config.cmpny_cd;
            let userInfo = await Query.QGetMemberInfo(obj, conn);

            res.render("authSignUp", {
                'config': config,
                'userInfo': userInfo[0],
            })
        } catch (e) {
            console.log(e)
        }
    });
}

exports.authProc = async (req, res, next) => {
    let {m_seq, seq} = req.body;
    let obj = {};

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {

            if (!seq) {
                res.json(rtnUtil.successFalse("500", "인증되지 않았습니다. 다시한번 인증해 주세요.","",""));
                return;
            }

            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            obj.domain = domain;
            let config = await Query.QGetConfig(obj, conn);

            obj.cmpnyCd = config.cmpny_cd;
            obj.mSeq = m_seq;
            obj.authYn = 'Y';

            await Query.QUptMember(obj, conn);

            conn.commit();

            res.json(rtnUtil.successTrue("회원가입 되었습니다."));
        } catch (e) {
            console.log(e);
            res.json(rtnUtil.successFalse("500", "안증번호이 실패했습니다.","",""));
        }
    });
}

exports.sendAccAuth = async (req, res, next) => {
    let {bank_code, bank_acc, acc_nm , bank_info} = req.body;
    let obj = {};
    obj.bank_code = bank_code;
    obj.bank_acc = bank_acc;
    obj.acc_nm = acc_nm;
    obj.bank_info = bank_info;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {

            let data = JSON.stringify({
                "acct_no":obj.bank_acc,
                "fnni_cd":obj.bank_code,
                "memb_nm":obj.acc_nm
            });
            console.log(data);

            var config = {
                method: 'post',
                url: cooconUrl + '/api/account-req',
                headers: {
                    'Content-Type': 'application/json'
                },
                data : data
            };

            await axios(config).then(async function (response) {
                console.log(JSON.stringify(response.data));
                console.log(response.data.data.verify_txt);
                obj.verify_txt = response.data.data.verify_txt;
                obj.verify_tr_dt = response.data.data.verify_tr_dt;
                obj.verify_tr_no = response.data.data.verify_tr_no;
                obj.rc = response.data.rc;
                if(response.data.rc == '0000') {

                    let ins = await Query.QInsBankCertification(obj, conn);
                    conn.commit();
                    console.log(ins)
                    res.json(rtnUtil.successTrue("1원이 전송 되었습니다.", ins.insertId));
                } else {
                    res.json(rtnUtil.successFalse('500', '전송을 실패했습니다.'));
                }
            })
            .catch(function (error) {
                console.log(error);
                res.json(rtnUtil.successFalse('500', '전송을 실패했습니다.'));
            });

        } catch (e) {
            console.log(e);
            res.json(rtnUtil.successFalse("500", "전송을 실패했습니다.","",""));
        }
    });
}

exports.accAuth = async (req, res, next) => {
    let {seq, verifyVal} = req.body;
    let obj = {};
    obj.seq = seq;
    obj.verify_val = verifyVal;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let certInfo = await Query.QGetBankCertification(obj, conn);
            if (certInfo.length < 1) {
                return res.json(rtnUtil.successFalse("500", "1원인증을 진행해 주세요.","",""));
            }

            var data = JSON.stringify({
                "verify_tr_dt":certInfo[0].verify_tr_dt,
                "verify_tr_no":certInfo[0].verify_tr_no,
                "verify_val":obj.verify_val
            });
            console.log(data);

            var config = {
                method: 'post',
                url: cooconUrl + '/api/account-res',
                headers: {
                    'Content-Type': 'application/json'
                },
                data : data
            };

            await axios(config).then(async function (response) {
                console.log(JSON.stringify(response.data));
                if(response.data.rc == '0000') {
                    await Query.QUptBankCertification(certInfo[0], conn)
                    conn.commit();
                    return res.json(rtnUtil.successTrue( "인증이 완료되었습니다.", obj));
                } else {
                    return res.json(rtnUtil.successFalse('500', "인증이 실패되었습니다. 잠시후 다시 시도해주세요", null));
                }
            })
            .catch(function (error) {
                return res.json(rtnUtil.successFalse('500', "인증이 실패되었습니다. 잠시후 다시 시도해주세요.", null));
            });

        } catch (e) {
            console.log(e);
            res.json(rtnUtil.successFalse("500", "인증이 실패되었습니다. 잠시후 다시 시도해주세요.","",""));
        }
    });
}


exports.updateInfo = async (req, res, next) => {
    let {userNm , userEmail} = req.body;
    let obj = {};
    obj.userNm = userNm;
    obj.userEmail = userEmail;
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.memId = req.user.memId;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
            let memInfo = await Query.QGetMemberInfo(obj, conn);
            if (memInfo.length < 1) {
                return res.json(rtnUtil.successFalse("500", "정보수정을 실패하였습니다.잠시후 다시 시도해주세요","",""));
            }
            obj.mSeq = memInfo[0].mSeq;
            let upt = await  Query.QUptMember(obj, conn);
            conn.commit();

            return res.json(rtnUtil.successTrue( "정보수정이 완료되었습니다."));

        } catch (e) {
            conn.rollback();
            console.log(e);
            res.json(rtnUtil.successFalse("500", "정보수정을 실패하였습니다. 잠시후 다시 시도해주세요.","",""));
        }
    });
}
