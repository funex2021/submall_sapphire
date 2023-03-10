const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./pay.sqlmap'); // 여기

const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const pagingUtil = require(path.join(process.cwd(), '/routes/services/pagingUtil'));
const apiUtil = require(path.join(process.cwd(), '/routes/services/apiUtil'));

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
const localUrl = properties.get('com.local.url');
const payTime = properties.get('com.pay.time');
const stoptime = properties.get('com.pay.stoptime');
const nftMallUrl = properties.get('com.nft.mall');

exports.buyview = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    mydb.executeTx(async conn => {
        try {
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


                let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
                obj.pageIndex = pageIndex;
                obj.rowsPerPage = 5;
                pagination.totalItems = totalPageCount;

                obj.cs_coin_sell = req.user.cs_coin_sell;
                obj.cs_coin_sell_detail = req.user.cs_coin_sell_detail;

                obj.mSeq = req.user.mSeq;
                let withdrawList = await Query.QGetNftBuyMainList(obj, conn);

                //nftList
                let cmpnyInfoByCd = await Query.QGetCompanyInfoByCmpnyCd(obj, conn);
                obj.cmpnyMemnerSeq = cmpnyInfoByCd[0].m_seq;
                obj.collection_seq = cmpnyInfoByCd[0].collection_seq
                let nftList = await Query.QgetNftList(obj, conn);

                balance = await Query.QGetBalance(obj, conn);

                let domain = '';
                if(req.headers.host.indexOf('localhost') > -1){
                    domain = localUrl;
                }else{
                    domain = req.headers.host;
                }
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
                    "nftMallUrl": nftMallUrl,
                    "nftList" : nftList,
                    "menuNum": 0 ,
                    "siteUrl" : localUrl
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

    mydb.executeTx(async conn => {
        try {
            let userId = req.user.memId;
            let cmpnyCd = req.user.cmpnyCd;
            let mSeq = req.user.mSeq;
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
                obj.mSeq = mSeq;
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

                let domain = '';
                if(req.headers.host.indexOf('localhost') > -1){
                    domain = localUrl;
                }else{
                    domain = req.headers.host;
                }
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
                obj.cmpnyMemnerSeq = cmpnyInfoByCd[0].m_seq;
                obj.collection_seq = cmpnyInfoByCd[0].collection_seq
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
                    "nftMallUrl": nftMallUrl,
                    "menuNum":1
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

    let {selectSellSeqArr, selectBuyAmountArr, selectSellPriceArr, bankSeq, operRate} = req.body;
    selectSellSeqArr = JSON.parse(selectSellSeqArr);
    selectBuyAmountArr = JSON.parse(selectBuyAmountArr);
    selectSellPriceArr = JSON.parse(selectSellPriceArr);

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
                        res.json(rtnUtil.successFalse("500", "입금신청은 " + payTime + "분에 1번씩 가능합니다.  " + payTime + "분 후 재 신청해주세요.", "", ""));
                    } else {
                        let sellStsCtn = await Query.QGetBuyReqSts(obj, conn);
                        console.log(sellStsCtn)
                        if (parseInt(sellStsCtn) > 0) {
                            conn.rollback();
                            logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 입금 확인 중에 있습니다. 구매중인 NFT를 확인하여 입금하거나 취소 후 재신청 해주세요."
                            logObj.isSuccess = "00"
                            await Query.QSetHistory(logObj, conn);
                            console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 입금 확인 중에 있습니다. 구매중인 NFT를 확인하여 입금하거나 취소 후 재신청 해주세요.")
                            res.json(rtnUtil.successFalse("500", "입금 확인 중에 있습니다.  완료 후 재 신청해주세요.", "", ""));
                        } else {
                            try {
                                //nft구매
                                let nftBuyObj = {};
                                nftBuyObj.coinSellSeq = obj.seq;
                                nftBuyObj.mSeq = req.user.mSeq;;
                                nftBuyObj.bankSeq = bankSeq;

                                //지갑정보조회(limit1)
                                let wallet = await Query.QGetMemberWalletLimit1(nftBuyObj, conn);
                                nftBuyObj.coinAddr = wallet[0].coin_addr;

                                let totalPrice = 0;
                                let selectTotalPrice = 0;

                                for (let j=0; j<selectSellPriceArr.length; j++) {
                                    selectTotalPrice = selectTotalPrice + parseInt(selectSellPriceArr[j]);
                                }

                                if (selectSellSeqArr.length > 0) {
                                    for (let i=0; i<selectSellSeqArr.length; i++) {
                                        nftBuyObj.buySeq = uuidv4();
                                        nftBuyObj.sellSeq = selectSellSeqArr[i];
                                        nftBuyObj.buyAmount = selectBuyAmountArr[i];
                                        nftBuyObj.ikonId = ikonId;
                                        nftBuyObj.buyType = buyType;
                                        console.log(nftBuyObj)
                                        //nft 수량체크
                                        let cnt = await Query.QGetNftSellCnt(nftBuyObj, conn);
                                        if (cnt < selectBuyAmountArr[i]) {
                                            conn.rollback();
                                            return res.json(rtnUtil.successFalse("500", "구매 수량이 부족합니다. 관리자에게 문의 하세요.", "", ""));
                                        }

                                        //nft 판매 정보 조회 후 총금액 저장
                                        let nftSellInfo = await Query.QgetNftSellInfo(nftBuyObj, conn);
                                        totalPrice = totalPrice + (nftSellInfo[0].sell_price * selectBuyAmountArr[i]);

                                        await Query.QSetInsNftBuy(nftBuyObj, conn);

                                        // for (let j=0; j<nftBuyObj.buyAmount; j++) {
                                        //     //매출 api 호출
                                        //     let data = {};
                                        //     data.m_id = req.user.memId;
                                        //     data.buy_seq = nftBuyObj.buySeq;
                                        //     data.nft_seq = nftSellInfo[0].nft_seq;
                                        //     data.tkn_id = j;
                                        //     data.pdt_nm = nftSellInfo[0].nft_nm;
                                        //     data.pdt_price = nftSellInfo[0].sell_price;
                                        //     data.pdt_desc = nftSellInfo[0].nft_desc;
                                        //     data.nft_url = nftMallUrl + nftSellInfo[0].nft_img;
                                        //     data.ardrp_gubun = 'SALE000000000000001';
                                        //     data.sls_sts = 'SALE000000000000004';

                                        //     await apiUtil.fnApiCall("/api/sales", data);
                                        // }
                                    }

                                    if (parseInt(totalPrice) == selectTotalPrice) {
                                        console.log('구매금액이 같음.');
                                        console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 구매 요청 ")
                                        logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 구매 요청 "
                                        logObj.isSuccess = "01"
                                        obj.usdCost = obj.buyNum;
                                        let domain = '';
                                        if(req.headers.host.indexOf('localhost') > -1){
                                            domain = localUrl;
                                        }else{
                                            domain = req.headers.host;
                                        }
                                        obj.domain = domain;
                                        let config = await Query.QGetConfigInfo(obj, conn);
                                        
                                        obj.buyNum = Number(obj.usdCost) * Number(operRate) * (1 + Number(config.buy_fee) / 100);
                                        obj.krwCost = Number(obj.usdCost) * Number(operRate);
                                        await Query.QSetHistory(logObj, conn);
                                        await Query.QSetCoinBuy(obj, conn);
                                        await Query.QSetIsBuy(obj, conn);
                                        obj.operRate = operRate;
                                        obj.fee = config.buy_fee;
                                        obj.platformFee = config.platform_fee;
                                        obj.platformAmount = Number(obj.buyNum) * (Number(config.platform_fee) / 100);
                                        obj.platformAmount = obj.platformAmount < 1000 ? 1000 : obj.platformAmount;
                                        await Query.QInsCoinSellCacl(obj, conn);
                                        
                                        conn.commit();
                                        res.json(rtnUtil.successTrue("200", "", ""));
                                    } else {
                                        conn.rollback();
                                        return res.json(rtnUtil.successFalse("500", "결제금액이 상이 합니다. 다시 구매해 주세요.", "", ""));
                                    }
                                } else {
                                    conn.rollback();
                                    return res.json(rtnUtil.successFalse("500", "구매가 실패했습니다. 관리자에게 문의해주세요.", "", ""));
                                }

                            } catch (e) {
                                conn.rollback();
                                console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 오류 발생  ")
                                console.log(e)
                                logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 오류 발생  "
                                logObj.isSuccess = "00"
                                await Query.QSetHistory(logObj, conn);
                                res.json(rtnUtil.successFalse("500", "구매에 실패 하였습니다. 관리자에게 문의 하세요.", "", ""));
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

    mydb.executeTx(async conn => {
        try {
            let userId = req.user.memId;
            let cmpnyCd = req.user.cmpnyCd;
            let cmpnyInfo = null;

            let obj = {}
            //let coinObj = await axios.get(CONSTS.API.URL+'/public/balance1/'+address);
            obj.cmpnyCd = cmpnyCd;
            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;
            obj.cs_coin_sell_detail = req.user.cs_coin_sell_detail;
            obj.cs_coin_trans_detail = req.user.cs_coin_trans_detail;
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

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount) ;
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let balance = await Query.QGetBalance(obj, conn);
            let withdrawList = await Query.QGetCoinBuyList(obj, conn);

            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
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
                "menuNum":2
            })

        } catch (e) {
            console.log('e : ', e)
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

            // nft은행정보 조회
            if (!req.user.bankSeq) {
                // 은행정보 조회후 seq 등록
                let nftBank = await Query.QGetNftBankInfoRandom(obj, conn);
                obj.bankSeq = nftBank[0].seq;
                obj.mSeq = req.user.mSeq;
                await Query.QUptMember(obj, conn);
                await Query.QInsMemberBankLog(obj, conn);

                conn.commit();
            } else {
                obj.bankSeq = req.user.bankSeq;
            }

            let bankInfo = await Query.QGetNftBankInfo(obj, conn);

            conn.commit();
            res.json(rtnUtil.successTrue("200", bankInfo[0]));

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

exports.selectNftBuyList = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {sellSeq} = req.body;

    let obj = {};
    obj.sellSeq = sellSeq;
    obj.cs_coin_sell_detail = req.user.cs_coin_sell_detail;

    mydb.executeTx(async conn => {
        try {

            let buyList = await Query.QGetNftBuyList(obj, conn);
            for (let i=0; i<buyList.length; i++) {
                buyList[i].nftMallUrl = nftMallUrl;
            }

            res.json(rtnUtil.successTrue("200", buyList));

        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", "", e.message, e));
        }
    });
}


exports.buyCancel = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);

    let {seq} = req.body;

    let obj = {};
    obj.seq = seq;
    obj.cs_coin_sell = req.user.cs_coin_sell;

    mydb.executeTx(async conn => {
        try {

            obj.sell_sts = 'CMDT00000000000027';
            await Query.QUptBuyStatus(obj, conn);
            obj.buy_status = 'CMDT00000000000086';
            await Query.QUptNftBuyStatus(obj, conn);

            conn.commit();

            res.json(rtnUtil.successTrue("200", ''));

        } catch (e) {
            conn.rollback();
            res.json(rtnUtil.successFalse("500", "", e.message, e));
        }
    });
}

exports.notice = async (req, res, next) => {
    let userId = req.user.memId;

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {pageIndex, srtDt, endDt} = req.body;

    if (srtDt == undefined || srtDt == '' || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        endDt = moment().format('YYYY-MM-DD');
        srtDt = moment().format('YYYY-MM-DD');
    }

    mydb.executeTx(async conn => {
        try {
            let obj = {};
            obj.cmpnyCd = req.user.cmpnyCd;
            obj.endDt = endDt;
            obj.srtDt = srtDt;

            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            console.log('domain : ' + domain)
            obj.domain = domain;
            let config = await Query.QGetConfigInfo(obj, conn);

            let totalPageCount = await Query.QGetSubNoticeListCnt(obj, conn);
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            };

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let noticeList = await Query.QGetSubNoticeList(obj, conn);

            res.render("notice", {
                'userId': userId,
                'config': config,
                'srtDt': srtDt,
                'endDt': endDt,
                'pagination': pagination,
                'noticeList': noticeList,
                "menuNum":3
            })

        } catch (e) {
            res.render("notice", {
                'userId': userId,
                'config': "",
                'srtDt': srtDt,
                'endDt': endDt,
                'pagination': "",
                'noticeList': "",
            })
        }
    });
}

exports.mynft = async (req, res, next) => {
    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {pageIndex, srtDt, endDt} = req.body;
    let userId = req.user.memId;

    if (srtDt == undefined || srtDt == '' || srtDt == null) {
        endDt = moment().format('YYYY-MM-DD');
        srtDt = moment().format('YYYY-MM-DD');
    }
    let obj = {}
    obj.srtDt = srtDt;
    obj.endDt = endDt;

    let search = {}
    search.srtDt = srtDt;
    search.endDt = endDt;

    mydb.executeTx(async conn => {
        try {
            let data = {};
            // data.address = req.user.coinAddr;

            // let apiRes = await apiUtil.fnApiCall("/getNFTByAddress", data);
            // let nftList = apiRes.data;


            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            obj.domain = domain;
            let config = await Query.QGetConfigInfo(obj, conn);

            obj.cmpnyCd = config.cmpny_cd;
            obj.airdrop_yn = 'Y';
            obj.sell_status= 'CMDT00000000000080';
            let nftList = await Query.QGetNftListByAirdrop(obj, conn);

            console.log('nftList::', nftList)

            res.render("sellRequest", {
                "config": config,
                "nftMallUrl": nftMallUrl,
                "nftList": nftList,
                "userId": userId,
            })

        } catch (e) {
            res.render("sellRequest", {

            })
        }
    });

}

exports.airView = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {pageIndex, srtDt, endDt} = req.body;

    if (srtDt == undefined || srtDt == '' || srtDt == null) {
        // endDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        // srtDt = moment().add(7, 'hours').format("YYYY-MM-DD")
        endDt = moment().format('YYYY-MM-DD');
        srtDt = moment().format('YYYY-MM-DD');
    }

    mydb.executeTx(async conn => {
        try {
            let userId = req.user.memId;
            let mSeq = req.user.mSeq;
            let cmpnyCd = req.user.cmpnyCd;
            let cmpnyInfo = null;

            let obj = {}
            //let coinObj = await axios.get(CONSTS.API.URL+'/public/balance1/'+address);
            obj.cmpnyCd = cmpnyCd;
            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;
            obj.cs_coin_sell_detail = req.user.cs_coin_sell_detail;
            obj.cs_coin_trans_detail = req.user.cs_coin_trans_detail;
            //은행정보 가져오기
            obj.userId = userId;
            obj.srtDt = srtDt;
            obj.endDt = endDt;
            obj.mSeq = mSeq;

            let search = {}

            search.srtDt = srtDt;
            search.endDt = endDt;

            console.log('JSON.stringify(obj) : ' + JSON.stringify(obj));

            cmpnyInfo = await Query.QGetCompanyInfo(obj, conn);
            let balanceCnt = await Query.QGetBalanceCnt(obj, conn);
            if (balanceCnt == 0) await Query.QInsMeberBalance(obj, conn);

            obj.memId = userId
            let totalPageCount = await Query.QGetAirdropListTotal(obj, conn);
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let balance = await Query.QGetBalance(obj, conn);
            let airList = await Query.QGetAirdropList(obj, conn);

            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            console.log('domain : ' + domain)
            obj.domain = domain;
            let config = await Query.QGetConfigInfo(obj, conn);

            console.log({pagination});
            res.render("airdrop", {
                'cmpnyInfo': cmpnyInfo[0],
                "airList": airList,
                "pagination": pagination,
                "coinObj": balance[0].balance,
                'amount': req.session.amount,
                'config': config,
                'srtDt': srtDt,
                'endDt': endDt,
                'userId': userId,
                "menuNum":5
            })

        } catch (e) {
            console.log('e : ', e)
            res.render("airdrop", {
                "airList": "",
                "pagination": pagination,
                "balance": 0,
                'amount': req.session.amount
            })
        }
    });

}

exports.airAddView = async (req, res, next) => {
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
            obj.mSeq = req.user.mSeq
            obj.cmpnyCd = req.user.cmpnyCd;
            obj.cs_coin_sell = req.user.cs_coin_sell;
            obj.cs_coin_trans = req.user.cs_coin_trans;
            obj.endDt = endDt;
            obj.srtDt = srtDt;

            let totalPageCount = await Query.QGetAirdropListTotal(obj, conn);
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }
            ;

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount)
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let airList = await Query.QGetAirdropList(obj, conn);
            let balance = await Query.QGetBalance(obj, conn);
            res.json(rtnUtil.successTrue("", {"airList": airList, "balance": balance}))
        } catch (e) {
            res.json(rtnUtil.successFalse('500', e.message, e, ''))
        }
    });
}


exports.haveNft = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {pageIndex} = req.body;


    mydb.executeTx(async conn => {
        try {
            let mSeq = req.user.mSeq;
            let userId = req.user.memId;
            
            let obj = {}
            obj.mSeq = mSeq;

            let totalPageCount = await Query.QGetMyNftListTotal(obj, conn);
            if (pageIndex == "" || pageIndex == null) {
                pageIndex = 1;
            }

            let pagination = await pagingUtil.getPagination(pageIndex, totalPageCount) ;
            obj.pageIndex = pageIndex;
            obj.rowsPerPage = pagination.rowsPerPage;
            pagination.totalItems = totalPageCount;

            let nftList = await Query.QGetMyNftList(obj, conn);

            console.log('nftList : ', nftList)

            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
                domain = localUrl;
            }else{
                domain = req.headers.host;
            }
            console.log('domain : ' + domain)
            obj.domain = domain;
            let config = await Query.QGetConfigInfo(obj, conn);

            console.log({pagination});
            res.render("haveNft", {
                "nftList": nftList,
                "pagination": pagination,
                'amount': req.session.amount,
                'config': config,
                "nftMallUrl": nftMallUrl,
                'userId': userId,
                "menuNum":6
            })

        } catch (e) {
            console.log('e : ', e)
            res.render("airdrop", {
                "nftList": "",
                "pagination": pagination,
                "balance": 0,
                'amount': req.session.amount
            })
        }
    });
}

exports.sell = async (req, res, next) => {

    let {sellPrice, nftSeq} = req.body;

    let obj = {}
    obj.sellSeq = uuidv4();
    obj.sellAmount = 1;
    obj.sellPrice = sellPrice;
    obj.nftSeq = nftSeq;
    obj.cmpnyCd = req.user.cmpnyCd;
    obj.mSeq = req.user.mSeq;
    obj.memId = req.user.memId;
    obj.sellStatus = "CMDT00000000000080";
    obj.payCd = "CMDT00000000000071";
    obj.contractAddress = "CMDT00000000000071";

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

            if (status == 'CMDT00000000000030') {

                let sellStsCtn = await Query.QGetSellReqSts(obj, conn);
                        console.log(sellStsCtn)
                        if (parseInt(sellStsCtn) > 0) {
                            conn.rollback();
                            logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 판매 확인 중에 있습니다. 판매중인 NFT를 확인하여 취소 후 재신청 해주세요."
                            logObj.isSuccess = "00"
                            await Query.QSetHistory(logObj, conn);
                            console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 판매 확인 중에 있습니다. 판매중인 NFT를 확인하여 취소 후 재신청 해주세요.")
                            res.json(rtnUtil.successFalse("500", "판매 확인 중에 있습니다.  완료 후 재 신청해주세요.", "", ""));
                        } else {
                            try {
                                let domain = '';
                                if(req.headers.host.indexOf('localhost') > -1){
                                    domain = localUrl;
                                }else{
                                    domain = req.headers.host;
                                }
                                obj.domain = domain;
                                let config = await Query.QGetConfigInfo(obj, conn);

                                obj.realPrice = Number(sellPrice) * (1 - Number(config.sell_fee) / 100);
                                obj.isSell = 'Y'
                                await Query.QInsNftSell(obj, conn);
                                conn.commit();
                                //cs_nft_buy insert
                                obj.userId = req.user.cmpnyNm;
                                let companyInfo = await Query.QGetCompanyInfo(obj, conn)
                                console.log('companyInfo :' , companyInfo)
                                let nftBuyObj = {};
                                nftBuyObj.coinSellSeq = obj.sellSeq;
                                nftBuyObj.mSeq = companyInfo[0].m_seq;
                                nftBuyObj.bankSeq = companyInfo[0].bank_seq;
                                let wallet = await Query.QGetMemberWalletLimit1(nftBuyObj, conn);
                                nftBuyObj.coinAddr = wallet[0].coin_addr;
                                nftBuyObj.buySeq = uuidv4();
                                nftBuyObj.sellSeq = obj.sellSeq;
                                nftBuyObj.buyAmount = 1;
                                nftBuyObj.ikonId = '';
                                nftBuyObj.buyType = '';
                                console.log(nftBuyObj)
                                await Query.QSetInsNftBuy(nftBuyObj, conn);
                                conn.commit();
                                obj.seq = obj.sellSeq;
                                obj.operRate = 0;
                                obj.fee = config.buy_fee;
                                obj.platformFee = config.platform_fee;
                                obj.platformAmount = Number(sellPrice) * (Number(config.platform_fee) / 100);
                                obj.platformAmount = obj.platformAmount < 1000 ? 1000 : obj.platformAmount;
                                await Query.QInsCoinSellCacl(obj, conn);
                                
                                res.json(rtnUtil.successTrue("200", "", ""));
                            } catch (e) {
                                conn.rollback();
                                console.log(obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 오류 발생  ")
                                console.log(e)
                                logObj.payResponse = obj.memId + " : " + req.user.companyName + " : " + obj.cmpnyCd + " -> 오류 발생  "
                                logObj.isSuccess = "00"
                                await Query.QSetHistory(logObj, conn);
                                res.json(rtnUtil.successFalse("500", "구매에 실패 하였습니다. 관리자에게 문의 하세요.", "", ""));
                            }

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

exports.aleardyCheck = async (req, res, next) => {

    let pool = req.app.get('pool');
    let mydb = new Mydb(pool);
    let {status} = req.body;


    mydb.executeTx(async conn => {
        try {
            let obj = {}
            if(status == 'buy') {
                obj.cmpnyCd = req.user.cmpnyCd;
                obj.memId = req.user.memId;
                obj.cs_coin_sell = req.user.cs_coin_sell;
                let sellStsCtn = await Query.QGetBuyReqSts(obj, conn);
                if (parseInt(sellStsCtn) > 0) {
                    res.json(rtnUtil.successFalse("500", "입금 확인 중에 있습니다.  완료 후 재 신청해주세요.", "", ""));
                } else {
                    res.json(rtnUtil.successTrue("200", "", ""));
                }
            } else {
                obj.mSeq = req.user.mSeq;
                let sellStsCtn = await Query.QGetSellReqSts(obj, conn);
                if (parseInt(sellStsCtn) > 0) {
                    res.json(rtnUtil.successFalse("500", "판매 확인 중에 있습니다.  완료 후 재 신청해주세요.", "", ""));
                } else {
                    res.json(rtnUtil.successTrue("200", "", ""));
                }
            }

        } catch (e) {
            console.log('e : ', e)
            res.json(rtnUtil.successFalse("500", "구매상태를 확인해주세요.", "", ""));
        }
    });
}