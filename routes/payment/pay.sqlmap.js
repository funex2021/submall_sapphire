function fnGetCompanyInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cm.m_seq, fn_get_name(cc.admin_grade) "
        sql += " , cc.input_info1_bank, cc.input_info1_acc, cc.input_info1_name, cc.input_info2 , cc.coin_rate, cc.seller_seq, cbw.balance "
        sql += " FROM cs_member cm inner join cs_company cc ON cm.cmpny_cd = cc.cmpny_cd AND cc.admin_grade = 'CMDT00000000000002'"
        sql += " inner join cs_balance_wallet cbw ON cbw.m_seq = cm.m_seq "
        sql += " WHERE cm.mem_id = '" + param.userId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "' "

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

function fnInsMeberBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_balance_wallet "
        sql += " (m_seq, balance) "
        sql += " VALUES( (select m_seq from cs_member cm where mem_id = '" + param.user_id + "' and cm.cmpny_cd = '" + param.cmpnyCd + "'), " + param.balance + ") "
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

function fnGetMseq(param, conn) {
    return new Promise(function (resolve, reject) {
        console.log(param);
        var sql = " select m_seq from cs_member cm where mem_id = '" + param.userId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "' "


        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetBalanceCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) cnt from cs_balance_wallet where m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.userId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "' ) "


        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnGetBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select balance from cs_balance_wallet where m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.userId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "' ) "


        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fsUptMeberBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " update cs_balance_wallet set balance = '" + param.balance + "'"
        sql += " where m_seq = '" + param.mSeq + "' "

        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnSetCoinBuy(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO " + param.cs_coin_sell + " "
        sql += " (seq, m_seq, buy_num, pay_num, seller_seq) "
        sql += "  VALUES('" + param.seq + "', (select m_seq from cs_member cm where mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "'), '" + param.buyNum + "'"
        sql += " , (select '" + param.buyNum + "' / csc.coin_rate from cs_company csc where csc.cmpny_cd = (select cmpny_cd from cs_member cm1 where cm1.mem_id = '" + param.memId + "' and cm1.cmpny_cd = '" + param.cmpnyCd + "')) "
        sql += " , (select seller_seq from cs_company csc where csc.cmpny_cd = (select cmpny_cd from cs_member cm1 where cm1.mem_id = '" + param.memId + "' and cm1.cmpny_cd = '" + param.cmpnyCd + "'))) "

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

// function fnSetCoinBuy(param, conn) {
//   return new Promise(function (resolve, reject) {
//     var sql =" INSERT INTO "+param.cs_coin_sell+" "
//     sql += " (seq, m_seq, buy_num, pay_num) "
//     sql += "  VALUES('"+param.seq+"', (select m_seq from cs_member cm where mem_id = '"+param.memId+"' and cm.cmpny_cd = '"+param.cmpnyCd+"'), '"+param.buyNum+"'"
//     sql += " , (select '"+param.buyNum+"' / csc.coin_rate from cs_company csc where csc.cmpny_cd = (select cmpny_cd from cs_member cm1 where cm1.mem_id = '"+param.memId+"' and cm1.cmpny_cd = '"+param.cmpnyCd+"'))) "

//     console.log(sql)
//     conn.query(sql, (err, ret) => {
//       if (err) {
//         console.log(err)
//         reject(err)
//       }
//       resolve(ret);
//     });
//   });
// }

function fnGetCoinBuyListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) totSum from (  "
        sql += "  select '구매' title ,'완료' confirm_sts_name,  ccs.buy_num , ccs.pay_num , ccs.send_txid , DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d %H:%i:%s') create_dt  "
        sql += "   from  " + param.cs_coin_sell + " ccs "
        sql += "  where  ccs.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "')"
        sql += "   union all"
        sql += "  select '전환' title ,case when ccsh.confirm_yn = 'Y' then '완료' else '처리중' end confirm_sts_name,  '' , cct.trans_num , cct.send_txid , DATE_FORMAT(fn_get_time(ccsh.create_dt), '%Y-%m-%d %H:%i:%s') create_dt "
        sql += "  from cs_coin_send_his ccsh "
        sql += "   inner join " + param.cs_coin_trans + " cct on ccsh.txid = cct.trans_seq and cct.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') ) t"
        sql += " WHERE DATE_FORMAT(t.create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";


        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totSum);
        });
    });
}

function fnGetAllCoinBuyListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) totSum from (  "
        sql += "  select '구매' title ,'완료' confirm_sts_name,  ccs.buy_num , ccs.pay_num , ccs.send_txid , DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d %H:%i:%s') create_dt  "
        sql += "   from  " + param.cs_coin_sell + " ccs "
        sql += "  where  ccs.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "')"
        sql += "   union all"
        sql += "  select '전환' title ,case when ccsh.confirm_yn = 'Y' then '완료' else '처리중' end confirm_sts_name,  '' , cct.trans_num , cct.send_txid , DATE_FORMAT(fn_get_time(ccsh.create_dt), '%Y-%m-%d %H:%i:%s') create_dt "
        sql += "  from cs_coin_send_his ccsh "
        sql += "   inner join " + param.cs_coin_trans + " cct on ccsh.txid = cct.trans_seq and cct.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') ) t"
        sql += " WHERE DATE_FORMAT(t.create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";


        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totSum);
        });
    });
}


function fnGetCoinBuyList(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql = " select title,confirm_sts_name,buy_num,pay_num,send_txid,t.create_dt from ( "
        sql += "  select '구매' title ,case when ccs.sell_sts = 'CMDT00000000000024' then '대기' "
        sql += "  when ccs.sell_sts = 'CMDT00000000000026' then '완료' else '취소' end confirm_sts_name,  ccs.buy_num , ccs.pay_num , ccs.send_txid , DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d %H:%i:%s') create_dt  "
        sql += "   from  " + param.cs_coin_sell + " ccs "
        sql += "  where  ccs.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "')"
        sql += "   union all"
        sql += "  select '전환' title ,case when ccsh.confirm_yn = 'Y' then '완료' else '처리중' end confirm_sts_name,  '0' as buy_num , cct.trans_num , cct.send_txid , DATE_FORMAT(fn_get_time(ccsh.create_dt), '%Y-%m-%d %H:%i:%s') create_dt "
        sql += "  from cs_coin_send_his ccsh "
        sql += "   inner join " + param.cs_coin_trans + " cct on ccsh.txid = cct.trans_seq and cct.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') ) t"
        sql += " WHERE DATE_FORMAT(t.create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";
        sql += "  order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

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

function fnGetAllCoinBuyList(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql = " select title,confirm_sts_name,buy_num,pay_num,send_txid,t.create_dt from ( "
        sql += "  select '구매' title ,case when ccs.sell_sts = 'CMDT00000000000024' then '대기' "
        sql += "  when ccs.sell_sts = 'CMDT00000000000026' then '완료' else '취소' end confirm_sts_name,  ccs.buy_num , ccs.pay_num , ccs.send_txid , DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d %H:%i:%s') create_dt  "
        sql += "   from  " + param.cs_coin_sell + " ccs "
        sql += "  where  ccs.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "')"
        sql += "   union all"
        sql += "  select '전환' title ,case when ccsh.confirm_yn = 'Y' then '완료' else '처리중' end confirm_sts_name,  '0' as buy_num , cct.trans_num , cct.send_txid , DATE_FORMAT(fn_get_time(ccsh.create_dt), '%Y-%m-%d %H:%i:%s') create_dt "
        sql += "  from cs_coin_send_his ccsh "
        sql += "   inner join " + param.cs_coin_trans + " cct on ccsh.txid = cct.trans_seq and cct.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') ) t"
        sql += "  order by t.create_dt desc "
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

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

function fnGetBuyReqSts(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) sellStsCtn from " + param.cs_coin_sell + " where m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') "
        sql += " and sell_sts = 'CMDT00000000000024' "

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].sellStsCtn);
        });
    });
}

function fnGetBuyMinCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) sellStsCtn from " + param.cs_coin_sell + " where m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') "
        sql += " and TIMESTAMPDIFF(minute, create_dt, now()) < " + param.payTime;

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].sellStsCtn);
        });
    });
}

function fnGetCoinSell(mSeq, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select pay_num from " + param.cs_coin_sell + " ccs "
        sql += " where ccs.send_yn = 'N' and m_seq = '" + mSeq + "'"
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

function fnGetStatus(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "select mem_status from cs_member cm where cm.mem_id = '" + param.memId + "' "
        sql += "and cmpny_cd = '" + param.cmpnyCd + "'"
        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].mem_status);
        });
    });
}

function fnSetHistory(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_pay_history"
        sql += " (cmpny_cd, m_seq, pay_code, pay_request, pay_response, user_ip, is_success) "
        sql += " VALUES('" + param.cmpnyCd + "', '" + param.mSeq + "', '" + param.payCode + "', '" + param.payRequest + "', '" + param.payResponse + "', '" + param.userIp + "', '" + param.isSuccess + "')  "

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

/*
* config 조회
*/
function fnGetConfigInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT max_amt, min_amt, is_captcha, is_pause, site_url, login_text, pwd_text, found_text, company_nm, suspension_min, is_auto_suspension_view  "
        sql += " FROM cs_pay_config "
        sql += " WHERE site_url = '" + param.domain + "'"

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

function fnGetUserTotBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT ifnull(sum(T.buy_num), 0) tot_pay_num, T.m_seq, T.sell_sts "
        sql += " FROM ( ";
        sql += " SELECT buy_num, m_seq, sell_sts "
        sql += " FROM " + param.cs_coin_sell + "  "
        sql += " union all "
        sql += " select buy_num, m_seq, sell_sts "
        sql += " from cs_coin_sell) T "
        sql += " WHERE T.m_seq = ( "
        sql += " select m_seq "
        sql += " from cs_member "
        sql += " where cmpny_cd = '" + param.cmpnyCd + "' and mem_id = '" + param.memId + "') "
        sql += " AND T.sell_sts = 'CMDT00000000000026'; "

        console.log('sql=> ', sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].tot_pay_num);
        });
    });
}

function fnGetUserTotTrans(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT T.* FROM ( "
        sql += "SELECT ifnull(sum(trans_num),0) trans_num, m_seq ";
        sql += " FROM " + param.cs_coin_trans + " "
        sql += " union all "
        sql += " select ifnull(sum(trans_num),0) trans_num, m_seq "
        sql += " from cs_coin_trans) T "
        sql += " WHERE m_seq =  (select m_seq from cs_member where cmpny_cd = '" + param.cmpnyCd + "' and mem_id = '" + param.memId + "') "

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


function fnSetShowAccount(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_account_show"
        sql += " (cmpny_cd, mem_id, is_buy) "
        sql += " VALUES('" + param.cmpnyCd + "', '" + param.memId + "', 'N')  "

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

function fnSetIsBuy(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_account_show"
        sql += " SET is_buy = 'Y' "
        sql += " WHERE cmpny_cd = '" + param.cmpnyCd + "' AND mem_id = '" + param.memId + "' "

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

function fnGetNftMstList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, cmpny_cd, buy_amount, nft_id, create_dt from cs_nft_mst";
        sql += " where 1=1";
        sql += " and cmpny_cd = '"+ param.cmpnyCd +"'";

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

function fnSetInsNftSell(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "insert into "+param.cs_nft_sell+" (seq, coin_sell_seq, nft_seq) values";
        sql += "('"+param.seq+"','"+param.coin_sell_seq+"','"+param.nft_seq+"')";

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

module.exports.QSetIsBuy = fnSetIsBuy;
module.exports.QSetShowAccount = fnSetShowAccount;

module.exports.QGetConfigInfo = fnGetConfigInfo;

module.exports.QSetHistory = fnSetHistory;

module.exports.QGetCompanyInfo = fnGetCompanyInfo;
module.exports.QSetCoinBuy = fnSetCoinBuy

module.exports.QGetCoinSell = fnGetCoinSell
module.exports.QGetBalance = fnGetBalance

module.exports.QGetBuyReqSts = fnGetBuyReqSts;
module.exports.QGetBuyMinCnt = fnGetBuyMinCnt;
module.exports.QGetCoinBuyListTotal = fnGetCoinBuyListTotal
module.exports.QGetCoinBuyList = fnGetCoinBuyList
module.exports.QGetAllCoinBuyList = fnGetAllCoinBuyList
module.exports.QGetAllCoinBuyListTotal = fnGetAllCoinBuyListTotal

module.exports.QInsMeberBalance = fnInsMeberBalance
module.exports.QUptMeberBalance = fsUptMeberBalance
module.exports.QGetMseq = fnGetMseq

module.exports.QGetBalanceCnt = fnGetBalanceCnt

module.exports.QGetStatus = fnGetStatus

module.exports.QGetUserTotBalance = fnGetUserTotBalance;
module.exports.QGetUserTotTrans = fnGetUserTotTrans;

module.exports.QgetNftMstList = fnGetNftMstList;
module.exports.QSetInsNftSell = fnSetInsNftSell;
