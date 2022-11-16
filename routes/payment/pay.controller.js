const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./pay.sqlmap'); // 여기

const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'));

const CONSTS = require(path.join(process.cwd(), '/routes/services/const'))

const {v4: uuidv4} = require('uuid');
const axios = require('axios');
const moment = require('moment');

var requestIp = require('request-ip');

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');
const payTime = properties.get('com.pay.time');
const stoptime = properties.get('com.pay.stoptime');

exports.buyview = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            console.log(req.user)
            let userId = req.user.memId;
            let cmpnyCd = req.user.cmpnyCd;
            let cmpnyInfo = null;
            // added
            let {pageIndex, srtDt, endDt} = req.body;

            let obj = {}
            if (srtDt == undefined || srtDt == '' || srtDt == null) {
                // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
                // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
                endDt = moment().format('YYYY-MM-DD');
                srtDt = moment().format('YYYY-MM-DD');
            }
            obj.srtDt = srtDt;
            obj.endDt = endDt;
            try {
                obj.cmpnyCd = cmpnyCd;
                obj.cs_coin_sell = req.user.cs_coin_sell;
                obj.cs_coin_trans = req.user.cs_coin_trans;
                //은행정보 가져오기
                obj.userId = userId;

                cmpnyInfo = await Query.QGetCompanyInfo(obj, conn);
                let balanceCnt = await Query.QGetBalanceCnt(obj, conn);
                if (balanceCnt == 0) await Query.QInsMeberBalance(obj, conn);

                obj.memId = userId
                let totalPageCount = await Query.QGetCoinBuyListTotal(obj, conn);
                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;

                let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
                obj.pageIndex = pageIndex;
                obj.rowsPerPage = 4;
                pagination.totalItems = totalPageCount;

                let withdrawList = await Query.QGetAllCoinBuyList(obj, conn);


                balance = await Query.QGetBalance(obj, conn);
                console.log(req.user.companyName, "balance :", balance[0].balance)

                let domain = req.headers.host;
                console.log('domain : ' + domain)
                obj.domain = domain;
                let config = await Query.QGetConfigInfo(obj, conn);
                let totBalance = await Query.QGetUserTotBalance(obj, conn);
                let totTrans = await Query.QGetUserTotTrans(obj, conn);
                if (totTrans.length == 0) {
                    totTrans = 0;
                } else {
                    totTrans = totTrans[0].trans_num;
                }

                res.render("main", {
                    'cmpnyInfo': cmpnyInfo[0],
                    'coinObj': balance[0].balance,
                    'amount': req.session.amount,
                    'config': config,
                    userId,
                    "withdrawList": withdrawList,
                    "totBalance": totBalance,
                    "totTrans": totTrans,
                    "pagination": pagination,
                })
            } catch (e) {
                console.log(e)
                obj.user_id = req.user.memId
                obj.balance = 0;
                cmpnyInfo = await Query.QGetCompanyInfo(userId, conn);

                res.render("main", {'cmpnyInfo': cmpnyInfo[0]})
            }
        } catch (e) {
            console.log(e)
            next(e);
        }
    });
}

exports.buypage = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.execute(async conn => {
        try {
            console.log(req.user)
            let userId = req.user.memId;
            let cmpnyCd = req.user.cmpnyCd;
            let cmpnyInfo = null;
            // added
            let {pageIndex, srtDt, endDt} = req.body;

            let obj = {}
            if (srtDt == undefined || srtDt == '' || srtDt == null) {
                // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
                // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
                endDt = moment().format('YYYY-MM-DD');
                srtDt = moment().format('YYYY-MM-DD');
            }
            obj.srtDt = srtDt;
            obj.endDt = endDt;
            try {
                obj.cmpnyCd = cmpnyCd;
                obj.cs_coin_sell = req.user.cs_coin_sell;
                obj.cs_coin_trans = req.user.cs_coin_trans;
                //은행정보 가져오기
                obj.userId = userId;

                cmpnyInfo = await Query.QGetCompanyInfo(obj, conn);
                let balanceCnt = await Query.QGetBalanceCnt(obj, conn);
                if (balanceCnt == 0) await Query.QInsMeberBalance(obj, conn);

                obj.memId = userId
                let totalPageCount = await Query.QGetCoinBuyListTotal(obj, conn);
                if (pageIndex == "" || pageIndex == null) {
                    pageIndex = 1;
                }
                ;

                let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
                obj.pageIndex = pageIndex;
                obj.rowsPerPage = pagination.rowsPerPage;
                pagination.totalItems = totalPageCount;

                let withdrawList = await Query.QGetAllCoinBuyList(obj, conn);


                balance = await Query.QGetBalance(obj, conn);
                console.log(req.user.companyName, "balance :", balance[0].balance)

                let domain = req.headers.host;
                console.log('domain : ' + domain)
                obj.domain = domain;
                let config = await Query.QGetConfigInfo(obj, conn);
                let totBalance = await Query.QGetUserTotBalance(obj, conn);
                let totTrans = await Query.QGetUserTotTrans(obj, conn);
                if (totTrans.length == 0) {
                    totTrans = 0;
                } else {
                    totTrans = totTrans[0].trans_num;
                }

                //nftList
                let cmpnyInfoByCd = await Query.QGetCompanyInfoByCmpnyCd(obj, conn);
                obj.mSeq = cmpnyInfoByCd[0].m_seq;
                let nftList = await Query.QgetNftList(obj, conn);

                res.render("buy", {
                    'cmpnyInfo': cmpnyInfo[0],
                    'coinObj': balance[0].balance,
                    'amount': req.session.amount,
                    'config': config,
                    userId,
                    "withdrawList": withdrawList,
                    "totBalance": totBalance,
                    "totTrans": totTrans,
                    "pagination": pagination,
                    "nftList": nftList,
                })
            } catch (e) {
                console.log(e)
                obj.user_id = req.user.memId
                obj.balance = 0;
                cmpnyInfo = await Query.QGetCompanyInfo(userId, conn);

                res.render("buy", {'cmpnyInfo': cmpnyInfo[0]})
            }
        } catch (e) {
            console.log(e)
            next(e);
        }
    });
}

exports.buy = async (req, res, next) => {

    let {
        price10000cnt, price10000seq, price30000cnt, price30000seq,
        price50000cnt, price50000seq, price100000cnt, price100000seq,
        price150000cnt, price150000seq, price200000cnt, price200000seq,
        price500000cnt, price500000seq, price1000000cnt, price1000000seq
    } = req.body;

    let obj = {}
    obj.seq = uuidv4();
    obj.buyNum = req.body.objKrw;
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.memId = req.user.memId;
    obj.cs_coin_sell = req.user.cs_coin_sell;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    //pay log
    var logObj = {};
    logObj.cmpnyCd = req.user.cmpnyCd;
    logObj.mSeq = req.user.mSeq;
    logObj.payCode = "[" + obj.buyNum + "] buy";
    logObj.payRequest = req.user.memId;
    logObj.userIp = requestIp.getClientIp(req);


    mydb.executeTx(async conn => {
        try {
            console.log("===========coin sell=============")

            let status = await Query.QGetStatus(obj, conn);

            console.log(status);
            if (status == 'CMDT00000000000030') {

                let now = moment();//.format("HH:mm:ss");
                let stop = moment(stoptime, "HH:mm:ss");//.format("HH:mm:ss");
                console.log(now);
                console.log(stop);
                let diff = moment(now).diff(stop, "second");
                console.log('분 차이: ', diff / 60);
                diff = diff >= 86400 ? diff % 86400 : diff;
                if (diff < 0 || 10 * 60 < diff) {
                    obj.payTime = payTime;
                    let minCnt = await Query.QGetBuyMinCnt(obj, conn);
                    if (parseInt(payTime) > 0 && minCnt > 0) {
                        conn.rollback();
                        logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 입금신청은 " + payTime + "분에 1번씩 가능합니다. " + payTime + "분 후 재 신청해주세요."
                        logObj.isSuccess = "00"
                        await Query.QSetHistory(logObj, conn);
                        console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 입금신청은 " + payTime + "분에 1번씩 가능합니다. " + payTime + "분 후 재 신청해주세요.")
                        res.json(rtnUtil.successFalse("500", "입금신청은 " + payTime + "분에 1번씩 가능합니다. <br> " + payTime + "분 후 재 신청해주세요.", "", ""));
                    } else {
                        let sellStsCtn = await Query.QGetBuyReqSts(obj, conn);
                        console.log(sellStsCtn)
                        if (parseInt(sellStsCtn) > 0) {
                            conn.rollback();
                            logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 입금 확인 중에 있습니다. 완료 후 재 신청해주세요."
                            logObj.isSuccess = "00"
                            await Query.QSetHistory(logObj, conn);
                            console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 임급 확인 중에 있습니다. 완료 후 재 신청해주세요.")
                            res.json(rtnUtil.successFalse("500", "입금 확인 중에 있습니다. <br> 완료 후 재 신청해주세요.", "", ""));
                        } else {
                            try {
                                console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 구매 요청 ")
                                logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 구매 요청 "
                                logObj.isSuccess = "01"
                                await Query.QSetHistory(logObj, conn);
                                await Query.QSetCoinBuy(obj, conn);
                                await Query.QSetIsBuy(obj, conn);

                                //nft구매
                                let nftBuyObj = {};
                                nftBuyObj.coinSellSeq = obj.seq;
                                nftBuyObj.mSeq = req.user.mSeq;;

                                if (price10000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price10000seq;
                                    nftBuyObj.buyAmount = price10000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }
                                if (price30000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price30000seq;
                                    nftBuyObj.buyAmount = price30000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }
                                if (price50000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price50000seq;
                                    nftBuyObj.buyAmount = price50000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }
                                if (price100000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price100000seq;
                                    nftBuyObj.buyAmount = price100000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }
                                if (price150000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price150000seq;
                                    nftBuyObj.buyAmount = price150000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }
                                if (price200000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price200000seq;
                                    nftBuyObj.buyAmount = price200000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }
                                if (price500000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price500000seq;
                                    nftBuyObj.buyAmount = price500000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }
                                if (price1000000cnt > 0) {
                                    nftBuyObj.buySeq = uuidv4();
                                    nftBuyObj.sellSeq = price1000000seq;
                                    nftBuyObj.buyAmount = price1000000cnt;
                                    await Query.QSetInsNftBuy(nftBuyObj, conn);
                                }

                                conn.commit();
                                res.json(rtnUtil.successTrue("200", "", ""));
                            } catch (e) {
                                conn.rollback();
                                console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 오류 발생  ")
                                console.log(e)
                                logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 오류 발생  "
                                logObj.isSuccess = "00"
                                await Query.QSetHistory(logObj, conn);
                                res.json(rtnUtil.successFalse("500", "구매에 실패 하였습니다. <br>관리자에게 문의 하세요.", "", ""));
                            }

                        }
                    }
                } else {
                    conn.rollback();
                    logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> " + stoptime + "부터 10분동안 점검시간 입니다."
                    logObj.isSuccess = "00"
                    await Query.QSetHistory(logObj, conn);
                    console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> " + stoptime + "부터 10분동안 점검시간 입니다.")
                    res.json(rtnUtil.successFalse("500", stoptime + "부터 10분동안 점검시간 입니다.", "", ""));
                }
            } else {
                conn.rollback();
                logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 회원상태를 확인해주세요."
                logObj.isSuccess = "00"
                await Query.QSetHistory(logObj, conn);
                console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 회원상태를 확인해주세요.")
                res.json(rtnUtil.successFalse("500", "회원상태를 확인해주세요.", "", ""));
            }

        } catch (e) {
            conn.rollback();
            console.log(e)
            logObj.payResponse = e.message
            logObj.isSuccess = "00"
            await Query.QSetHistory(logObj, conn);
            res.json(rtnUtil.successFalse("500", "", e.message, e));
        }
    });
}

exports.withdraw = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {pageIndex, srtDt, endDt} = req.body;

    if (srtDt == undefined || srtDt == '' || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        endDt = moment().format('YYYY-MM-DD');
        srtDt = moment().format('YYYY-MM-DD');
    }

    mydb.execute(async conn => {
        try {
            console.log(req.user)
            let userId = req.user.memId;
            let cmpnyCd = req.user.cmpnyCd;
            let cmpnyInfo = null;

            let obj = {}
            //let coinObj = await axios.get(CONSTS.API.URL+'/public/balance1/'+address);
            obj.cmpnyCd = cmpnyCd;
            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;
            //은행정보 가져오기
            obj.userId = userId;
            obj.srtDt = srtDt;
            obj.endDt = endDt;

            let search = {}

            search.srtDt = srtDt;
            search.endDt = endDt;

            console.log('JSON.stringify(obj) : ' + JSON.stringify(obj));

            cmpnyInfo = await Query.QGetCompanyInfo(obj, conn);
            let balanceCnt = await Query.QGetBalanceCnt(obj, conn);
            if (balanceCnt == 0) await Query.QInsMeberBalance(obj, conn);

            obj.memId = userId
            let totalPageCount = await Query.QGetCoinBuyListTotal(obj, conn);
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let balance = await Query.QGetBalance(obj, conn);
            let withdrawList = await Query.QGetCoinBuyList(obj, conn);

            let domain = req.headers.host;
            console.log('domain : ' + domain)
            obj.domain = domain;
            let config = await Query.QGetConfigInfo(obj, conn);

            console.log({pagination});
            res.render("withdraw", {
                'cmpnyInfo': cmpnyInfo[0],
                "withdrawList": withdrawList,
                "pagination": pagination,
                "coinObj": balance[0].balance,
                'amount': req.session.amount,
                'config': config,
                'srtDt': srtDt,
                'endDt': endDt,
                'userId': userId,
            })

        } catch (e) {
            res.render("withdraw", {
                "withdrawList": "",
                "pagination": pagination,
                "balance": 0,
                'amount': req.session.amount
            })
        }
    });

}

exports.addWithdraw = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {pageIndex, srtDt, endDt} = req.body;

    if (srtDt == undefined || srtDt == '' || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        endDt = moment().format('YYYY-MM-DD');
        srtDt = moment().format('YYYY-MM-DD');
    }

    console.log('pageIndex : ' + pageIndex)
    console.log('srtDt : ' + srtDt)
    console.log('endDt : ' + endDt)
    mydb.execute(async conn => {
        try {
            let obj = {};
            obj.memId = req.user.memId
            obj.cmpnyCd = req.user.cmpnyCd;
            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;
            obj.endDt = endDt;
            obj.srtDt = srtDt;

            let totalPageCount = await Query.QGetAllCoinBuyListTotal(obj, conn);
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let withdrawList = await Query.QGetCoinBuyList(obj, conn);
            let balance = await Query.QGetBalance(obj, conn);
            res.json(rtnUtil.successTrue("", {"withdrawList": withdrawList, "balance": balance}))
        } catch (e) {
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });

}

exports.showAccount = async (req, res, next) => {


    let obj = {}
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.memId = req.user.memId;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    //pay log
    var logObj = {};
    logObj.cmpnyCd = req.user.cmpnyCd;
    logObj.mSeq = req.user.mSeq;
    logObj.payCode = "account view";
    logObj.payRequest = req.user.memId;
    logObj.userIp = requestIp.getClientIp(req);

    mydb.executeTx(async conn => {
        try {
            logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 계좌 확인 요청 "
            logObj.isSuccess = "01"
            await Query.QSetHistory(logObj, conn);
            await Query.QSetShowAccount(obj, conn);
            conn.commit();
            res.json(rtnUtil.successTrue("200", "", ""));

        } catch (e) {
            conn.rollback();
            console.log(e)
            logObj.payResponse = e.message
            logObj.isSuccess = "00"
            await Query.QSetHistory(logObj, conn);
            res.json(rtnUtil.successFalse("500", "", e.message, e));
        }
    });
}