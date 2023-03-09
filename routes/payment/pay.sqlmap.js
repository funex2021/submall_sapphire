function fnGetCompanyInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cm.m_seq, fn_get_name(cc.admin_grade) "
        sql += " , cc.input_info1_bank, cc.input_info1_acc, cc.input_info1_name, cc.input_info2 , cc.coin_rate, cc.seller_seq, cbw.balance, cc.point_view_yn, sign_yn "
        sql += " , cnb.bank_nm nft_bank_nm, cnb.bank_acc nft_bank_acc, cnb.acc_nm nft_acc_nm";
        sql += " , (select seq from cs_bank where m_seq = cm.m_seq) bank_seq";
        sql += " FROM cs_member cm inner join cs_company cc ON cm.cmpny_cd = cc.cmpny_cd AND cc.admin_grade = 'CMDT00000000000002'"
        sql += " inner join cs_balance_wallet cbw ON cbw.m_seq = cm.m_seq "
        sql += " left join cs_nft_bank cnb on cnb.seq = cm.bank_seq";
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
        sql += " (seq, m_seq, buy_num, pay_num, usd_cost, krw_cost, seller_seq, coin_rate) "
        sql += "  VALUES('" + param.seq + "', (select m_seq from cs_member cm where mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "'), '" + param.buyNum + "'"
        sql += " , (select floor('" + param.buyNum + "' * (csc.coin_rate/100)) from cs_company csc where csc.cmpny_cd = (select cmpny_cd from cs_member cm1 where cm1.mem_id = '" + param.memId + "' and cm1.cmpny_cd = '" + param.cmpnyCd + "')) "
        sql += " , '" + param.usdCost + "', '"+param.krwCost+"', (select seller_seq from cs_company csc where csc.cmpny_cd = (select cmpny_cd from cs_member cm1 where cm1.mem_id = '" + param.memId + "' and cm1.cmpny_cd = '" + param.cmpnyCd + "')) "
        sql += " , (select csc.coin_rate from cs_company csc where csc.cmpny_cd = (select cmpny_cd from cs_member cm1 where cm1.mem_id = '" + param.memId + "' and cm1.cmpny_cd = '" + param.cmpnyCd + "'))) "

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
        // sql += " WHERE DATE_FORMAT(t.create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";


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

        var sql = " select seq, title,confirm_sts_name,buy_num,pay_num,send_txid,t.create_dt, nftCnt, "
        sql += "  (select cnm.file_path from cs_nft_mst cnm inner join cs_nft_sell cns on cnm.seq = cns.nft_seq where cns.sell_seq = sellSeq limit 1) nftImg, "
        sql += "  (select cnm.nft_nm from cs_nft_mst cnm inner join cs_nft_sell cns on cnm.seq = cns.nft_seq where cns.sell_seq = sellSeq limit 1) nftNm "
        sql += "  from (  "
        sql += "  select ccs.seq seq, '구매' title ,case when ccs.sell_sts = 'CMDT00000000000024' then '대기' "
        sql += "  when ccs.sell_sts = 'CMDT00000000000026' then '완료' else '취소' end confirm_sts_name,  ccs.buy_num , ccs.pay_num , ccs.send_txid , DATE_FORMAT(fn_get_time(ccs.create_dt), '%Y-%m-%d %H:%i:%s') create_dt  "
        sql += " ,(select ifnull(sum(cnb.buy_amount), 0) from cs_nft_buy cnb where cnb.coin_sell_seq = ccs.seq) nftCnt"
        sql += " ,(select sell_seq from cs_nft_buy where coin_sell_seq = ccs.seq limit 1) sellSeq"
        // sql += " ,(select cnm.file_path from " + param.cs_coin_sell_detail + " ccsd left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq where ccsd.sell_seq = ccs.seq limit 1) nftImg"
        // sql += " ,(select cnm.nft_nm from " + param.cs_coin_sell_detail + " ccsd left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq where ccsd.sell_seq = ccs.seq limit 1) nftNm"
        sql += "   from  " + param.cs_coin_sell + " ccs "
        sql += "  where  ccs.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "')"

        sql += "   union all"
        sql += "  select ccsl.seq seq, '구매' title ,case when ccsl.sell_sts = 'CMDT00000000000024' then '대기' "
        sql += "  when ccsl.sell_sts = 'CMDT00000000000026' then '완료' else '취소' end confirm_sts_name,  ccsl.buy_num , ccsl.pay_num , ccsl.send_txid , DATE_FORMAT(fn_get_time(ccsl.create_dt), '%Y-%m-%d %H:%i:%s') create_dt  "
        sql += " ,(select ifnull(sum(cnb.buy_amount), 0) from cs_nft_buy cnb where cnb.coin_sell_seq = ccsl.seq) nftCnt"
        sql += " ,(select sell_seq from cs_nft_buy where coin_sell_seq = ccsl.seq limit 1) sellSeq"
        // sql += " ,(select cnm.file_path from cs_coin_sell_detail_log ccsd left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq where ccsd.sell_seq = ccsl.seq limit 1) nftImg"
        // sql += " ,(select cnm.nft_nm from cs_coin_sell_detail_log ccsd left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq where ccsd.sell_seq = ccsl.seq limit 1) nftNm"
        sql += "   from cs_coin_sell_log ccsl "
        sql += "  where  ccsl.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "')"

        sql += "   union all"
        sql += "  select '' seq, '전환' title ,case when ccsh.confirm_yn = 'Y' then '완료' else '처리중' end confirm_sts_name,  '0' as buy_num , cct.trans_num , cct.send_txid , DATE_FORMAT(fn_get_time(ccsh.create_dt), '%Y-%m-%d %H:%i:%s') create_dt, '' nftCnt, '' sellSeq "
        sql += "  from cs_coin_send_his ccsh "
        sql += "   inner join " + param.cs_coin_trans + " cct on ccsh.txid = cct.trans_seq and cct.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') "

        sql += "   union all"
        sql += "  select '' seq, '전환' title ,case when ccsh.confirm_yn = 'Y' then '완료' else '처리중' end confirm_sts_name,  '0' as buy_num , cctl.trans_num , cctl.send_txid , DATE_FORMAT(fn_get_time(ccsh.create_dt), '%Y-%m-%d %H:%i:%s') create_dt, '' nftCnt, '' sellSeq "
        sql += "  from cs_coin_send_his ccsh "
        sql += "   inner join cs_coin_trans_log cctl on ccsh.txid = cctl.trans_seq and cctl.m_seq = (select m_seq from cs_member cm where cm.mem_id = '" + param.memId + "' and cm.cmpny_cd = '" + param.cmpnyCd + "') "

        sql += " ) t"
        // sql += " WHERE DATE_FORMAT(t.create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";
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
        var sql = " SELECT max_amt, min_amt, is_captcha, is_pause, site_url, login_text, pwd_text, found_text, cmpny_cd, company_nm, suspension_min, is_auto_suspension_view, IFNULL(sell_fee, 0) sell_fee, IFNULL(buy_fee, 0) buy_fee, IFNULL(platform_fee, 0) platform_fee  "
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

function fngetNftList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select cns.sell_seq, cns.nft_seq, cns.cmpny_cd, cns.sell_price, cns.sell_amount, (select ifnull(sum(cnb.buy_amount), 0) from cs_nft_buy cnb where cnb.sell_seq = cns.sell_seq and cnb.buy_status = 'CMDT00000000000087') buy_amount, cnm.file_path nft_img, cns.nft_nm from cs_nft_sell cns";
        sql += " left join cs_nft_mst cnm on cnm.seq = cns.nft_seq";
        sql += " where 1=1";
        sql += " and cns.m_seq = '" + param.cmpnyMemnerSeq + "'";
        // sql += " and cns.cmpny_cd = '"+ param.cmpnyCd +"'";
        sql += " and cns.collection_seq = '"+ param.collection_seq +"'";
        sql += " and cns.sell_status = 'CMDT00000000000080'"
        sql += " order by sell_price asc";

        console.log('fngetNftList => ', sql)
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

function fnGetCompanyInfoByCmpnyCd(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select cmpny_cd, cmpny_id, cmpny_nm, m_seq, collection_seq from cs_company";
        sql += " where 1=1";
        sql += " and cmpny_cd = '" + param.cmpnyCd + "'";

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

function fnSetInsNftBuy(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "insert into cs_nft_buy (buy_seq, sell_seq, m_seq, buy_amount, coin_sell_seq, bank_seq, coin_addr, ikon_id, buy_type) values";
        sql += " ('"+param.buySeq+"','"+param.sellSeq+"','"+param.mSeq+"','"+param.buyAmount+"','"+param.coinSellSeq+"','"+param.bankSeq+"','"+param.coinAddr+"','"+param.ikonId+"','"+param.buyType+"')";

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

function fnGetNftBankInfoRandom(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, bank_nm, bank_acc, acc_nm, use_yn, create_dt from cs_nft_bank";
        sql += " where 1=1";
        sql += " order by rand()";
        sql += " limit 1";

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

function fnUptMember(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "update cs_member set";
        sql += " update_dt = NOW()";
        if (param.bankSeq != '' && param.bankSeq != null) {
            sql += " ,bank_seq = '"+param.bankSeq+"'";
        }
        sql += " where 1=1";
        sql += " and m_seq = '"+param.mSeq+"'";

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

function fnGetNftBankInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, bank_nm, bank_acc, acc_nm, use_yn, create_dt ";
        sql += " ,IFNULL((select oper_rate from cs_exchange_rate order by create_dt desc limit 1), 1360) oper_rate ";
        sql += " from cs_nft_bank";
        sql += " where 1=1";
        sql += " and seq = '"+param.bankSeq+"'";

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

function fnGetNftSellCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select cns.sell_amount - (select ifnull(sum(cnb.buy_amount), 0) from cs_nft_buy cnb where cnb.sell_seq = cns.sell_seq and cnb.buy_status in ('CMDT00000000000085', 'CMDT00000000000087')) cnt from cs_nft_sell cns";
        sql += " where 1=1";
        sql += " and cns.sell_seq ='"+param.sellSeq+"'";

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fnInsMemberBankLog(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "insert into cs_member_bank_log (m_seq, bank_seq) values";
        sql += " ('"+param.mSeq+"','"+param.bankSeq+"')";

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

function fnGetMemberWalletLimit1(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, m_seq, coin_typ, coin_addr, coin_pk from cs_wallet";
        sql += " where 1=1";
        sql += " and m_seq ='"+param.mSeq+"'";
        sql += " limit 1";

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

function fnGetNftBuyList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        // sql += "select cnb.buy_amount, cns.nft_nm, cns.nft_img from cs_nft_buy cnb";
        // sql += " left join cs_nft_sell cns on cns.sell_seq = cnb.sell_seq";
        // sql += " where 1=1";
        // sql += " and cnb.coin_sell_seq = '"+param.sellSeq+"'";

        sql += "select cnm.file_path nft_img, cnm.nft_nm, ccsd.send_txid, '1' buy_amount from "+param.cs_coin_sell_detail+" ccsd";
        sql += " left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq";
        sql += " where 1=1";
        sql += " and ccsd.sell_seq ='"+param.sellSeq+"'";
        sql += " union all";
        sql += " select cnm.file_path nft_img, cnm.nft_nm, ccsd.send_txid, '1' buy_amount from cs_coin_sell_detail_log ccsd";
        sql += " left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq";
        sql += " where 1=1";
        sql += " and ccsd.sell_seq ='"+param.sellSeq+"'";


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

function fnUptBuyStatus(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "update "+param.cs_coin_sell+" set";
        sql += " update_dt = NOW()";
        sql += " ,sell_sts = '"+param.sell_sts+"'";
        sql += " where 1=1";
        sql += " and seq = '"+param.seq+"'";

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

function fnUptNftBuyStatus(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "update cs_nft_buy set";
        sql += " buy_status = '"+param.buy_status+"'";
        sql += " where 1=1";
        sql += " and coin_sell_seq = '"+param.seq+"'";

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

function fnGetFaqList(obj, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, title, content, DATE_FORMAT(create_dt, '%Y-%m-%d') create_dt from cs_faq";
        sql += " where 1=1";
        sql += " and use_yn = 'Y'"
        sql += " order by create_dt desc";
        sql += " limit 0,5";

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

function fnGetNoticeList(obj, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, title, content, DATE_FORMAT(create_dt, '%Y-%m-%d') create_dt from cs_notice";
        sql += " where 1=1";
        sql += " and use_yn = 'Y'"
        sql += " order by create_dt desc";
        sql += " limit 0,5";

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

function fnGetSubNoticeList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select seq, title, content, DATE_FORMAT(create_dt, '%Y-%m-%d') create_dt from cs_notice_sub";
        sql += " where 1=1";
        sql += " and cmpny_cd = '"+param.cmpnyCd+"'";
        sql += " and use_yn = 'Y'"
        sql += " and DATE_FORMAT(create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";
        sql += " order by create_dt desc";
        sql += " limit " + (param.pageIndex - 1) * 10 + "," + param.rowsPerPage;

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

function fnGetSubNoticeListCnt(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select count(1) cnt from cs_notice_sub";
        sql += " where 1=1";
        sql += " and cmpny_cd = '"+param.cmpnyCd+"'";
        sql += " and use_yn = 'Y'"
        sql += " and DATE_FORMAT(create_dt, '%Y-%m-%d') between DATE_FORMAT('" + param.srtDt + "', '%Y-%m-%d') and DATE_FORMAT('" + param.endDt + "', '%Y-%m-%d') ";
        sql += " order by create_dt desc";

        console.log(sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].cnt);
        });
    });
}

function fngetNftSellInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select sell_seq, nft_seq, sell_amount, sell_price, sell_status, nft_nm, nft_desc, nft_img from cs_nft_sell";
        sql += " where 1=1";
        sql += " and sell_seq = '"+param.sellSeq+"'";

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

function fnGetNftListByAirdrop(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select cns.sell_seq, cns.nft_seq, cns.sell_amount, cns.sell_price, cns.sell_status, cnm.file_path nft_img from cs_nft_sell cns";
        sql += " left join cs_nft_mst cnm on cnm.seq = cns.nft_seq";
        sql += " where 1=1";
        sql += " and cns.airdrop_yn = '" + param.airdrop_yn + "'";
        sql += " and cns.cmpny_cd = '" + param.cmpnyCd + "'";
        sql += " and cns.sell_status = '" + param.sell_status + "'";
        sql += " order by cns.create_dt desc";

        console.log('fnGetNftListByAirdrop : ', sql)
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}


function fnGetNftBuyMainList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "select t.* from ( ";
        sql += " select cnm.file_path nft_img, cnm.nft_nm, ccsd.send_txid, '1' buy_amount , DATE_FORMAT(ccsl.create_dt, '%Y-%m-%d %H:%i:%s') as create_dt from "+param.cs_coin_sell_detail+" ccsd";
        sql += " left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq";
        sql += " inner join "+param.cs_coin_sell+" ccsl on ccsd.sell_seq  = ccsl.seq";
        sql += " where 1=1";
        sql += " and ccsl.m_seq = '" + param.mSeq + "'";
        sql += " union all";
        sql += " select cnm.file_path nft_img, cnm.nft_nm, ccsd.send_txid, '1' buy_amount , DATE_FORMAT(ccsl.create_dt, '%Y-%m-%d %H:%i:%s') as create_dt  from cs_coin_sell_detail_log ccsd";
        sql += " left join cs_nft_mst cnm on cnm.seq = ccsd.nft_seq";
        sql += " inner join cs_coin_sell_log ccsl on ccsd.sell_seq  = ccsl.seq";
        sql += " where 1=1";
        sql += " and ccsl.m_seq = '" + param.mSeq + "'";
        sql += " ) t "
        sql += " order by t.create_dt desc "
        sql += " limit 0,5 ";

        console.log('fnGetNftBuyMainList >> ' , sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetAirdropList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";

        sql += " select (select file_path from cs_nft_mst cnm where seq = cna.nft_seq) nft_img, ";
        sql += "  (select nft_nm from cs_nft_mst cnm where seq = cna.nft_seq) nft_nm, ";
        sql += " nft_seq, price, tot_price, txid, DATE_FORMAT(fn_get_time(cna.create_dt), '%Y-%m-%d %H:%i:%s') create_dt ";
        sql += " from cs_nft_airdrop cna where m_seq = '" + param.mSeq + "' order by create_dt desc ";
        sql += " limit " + (param.pageIndex - 1) * param.rowsPerPage + "," + param.rowsPerPage

        console.log('fnGetAirdropList >> ' , sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnGetAirdropListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";

        sql += " select count(1) totSum ";
        sql += " from cs_nft_airdrop cna where m_seq = '" + param.mSeq + "' order by create_dt desc ";


        console.log('fnGetAirdropListTotal >> ' , sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].totSum);
        });
    });
}

function fnGetMyNftListTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "select count(1) count from (";

        sql += " select COUNT(nft_seq) from ";
        sql += " ((select cns.nft_seq, cnb.buy_amount, 0 tot_price from cs_nft_buy cnb inner join cs_nft_sell cns on cnb.sell_seq = cns.sell_seq  ";
        sql += " where cnb.m_seq = '" + param.mSeq + "' ";
        sql += " and cnb.buy_status = 'CMDT00000000000087') ";
        sql += " union all ";
        sql += " (select nft_seq, 1 buy_amount, tot_price from cs_nft_airdrop where m_seq = '" + param.mSeq + "' ";
        sql += " and use_yn = 'Y' order by create_dt desc limit 1)) T inner join cs_nft_mst cnm on T.nft_seq = cnm.seq ";
        sql += " group by nft_seq) TT ";

        console.log('fnGetMyNftListTotal >> ' , sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret[0].count);
        });
    });
}

function fnGetMyNftList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";

        sql += " select cnm.nft_nm, cnm.nft_desc, cnm.contract_addr, cnm.file_path, T.nft_seq, sum(T.buy_amount) buy_amount, sum(T.tot_price) price from ";
        sql += " ((select cns.nft_seq, cnb.buy_amount, 0 tot_price from cs_nft_buy cnb inner join cs_nft_sell cns on cnb.sell_seq = cns.sell_seq  ";
        sql += " where cnb.m_seq = '" + param.mSeq + "' ";
        sql += " and cnb.buy_status = 'CMDT00000000000087') ";
        sql += " union all ";
        sql += " (select nft_seq, 1 buy_amount, tot_price from cs_nft_airdrop where m_seq = '" + param.mSeq + "' ";
        sql += " and use_yn = 'Y' order by create_dt desc limit 1)) T inner join cs_nft_mst cnm on T.nft_seq = cnm.seq ";
        sql += " group by nft_seq ";

        console.log('fnGetMyNftList >> ' , sql);
        conn.query(sql, (err, ret) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(ret);
        });
    });
}

function fnInsNftSell(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += " INSERT INTO cs_nft_sell ";
        sql += " (sell_seq, nft_seq, cmpny_cd, sell_amount, sell_price, sell_status, pay_cd, m_seq, create_dt, update_dt, contract_address, token_id, sell_type, nft_nm, nft_desc, category_cd, nft_img, collection_seq, is_public, from_addr, airdrop_yn, real_price) ";
        sql += " VALUES('"+param.sellSeq+"','"+param.nftSeq+"','"+param.cmpnyCd+"','"+param.sellAmount+"','"+param.sellPrice+"', ";
        sql += " '"+param.sellStatus+"','"+param.payCd+"','"+param.mSeq+"', now(), now(), ";
        sql += " (select contract_addr from cs_nft_mst where seq = '"+param.nftSeq+"'), (select token_id from cs_nft_airdrop where m_seq = '"+param.mSeq+"' and nft_seq = '"+param.nftSeq+"' and use_yn = 'Y' limit 1),'CMDT00000000000084', ";
        sql += " (select nft_nm from cs_nft_mst where seq = '"+param.nftSeq+"'), (select nft_desc from cs_nft_mst where seq = '"+param.nftSeq+"'), ";
        sql += " (select category_cd from cs_nft_mst where seq = '"+param.nftSeq+"'), (select file_path from cs_nft_mst where seq = '"+param.nftSeq+"'), (select collection_seq from cs_nft_mst where seq = '"+param.nftSeq+"'), 'N', '', 'Y', '"+param.realPrice+"') ";

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




function fnInsCoinSellCacl(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += " INSERT INTO cs_coin_sell_cacl ";
        sql += " (sell_seq, oper_rate, fee, platform_fee, platform_amount, create_dt) ";
        sql += " VALUES('"+param.seq+"', '"+param.operRate+"', '"+param.fee+"', '"+param.platformFee+"', '"+param.platformAmount+"', CURRENT_TIMESTAMP) ";

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

function fnGetSellReqSts(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " select count(1) sellStsCtn from cs_nft_sell where m_seq = '"+param.mSeq+"' "
        sql += " and sell_status = 'CMDT00000000000080' "

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

function fnGetCompanyInfoByMseq(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cm.m_seq, fn_get_name(cc.admin_grade) "
        sql += " , cc.input_info1_bank, cc.input_info1_acc, cc.input_info1_name, cc.input_info2 , cc.coin_rate, cc.seller_seq, cbw.balance, cc.point_view_yn, sign_yn "
        sql += " , cnb.bank_nm nft_bank_nm, cnb.bank_acc nft_bank_acc, cnb.acc_nm nft_acc_nm";
        sql += " , (select seq from cs_bank where m_seq = cm.m_seq) bank_seq";
        sql += " FROM cs_member cm inner join cs_company cc ON cm.cmpny_cd = cc.cmpny_cd AND cc.admin_grade = 'CMDT00000000000002'"
        sql += " inner join cs_balance_wallet cbw ON cbw.m_seq = cm.m_seq "
        sql += " left join cs_nft_bank cnb on cnb.seq = cm.bank_seq";
        sql += " WHERE cm.m_seq = '" + param.mSeq + "' "

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

module.exports.QGetCompanyInfoByMseq = fnGetCompanyInfoByMseq;
module.exports.QGetSellReqSts = fnGetSellReqSts;
module.exports.QInsCoinSellCacl = fnInsCoinSellCacl;
module.exports.QInsNftSell = fnInsNftSell;
module.exports.QGetMyNftListTotal = fnGetMyNftListTotal;
module.exports.QGetMyNftList = fnGetMyNftList;
module.exports.QGetAirdropListTotal = fnGetAirdropListTotal;
module.exports.QGetAirdropList = fnGetAirdropList;
module.exports.QGetNftBuyMainList = fnGetNftBuyMainList;
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
module.exports.QgetNftList = fngetNftList;
module.exports.QSetInsNftSell = fnSetInsNftSell;
module.exports.QGetCompanyInfoByCmpnyCd = fnGetCompanyInfoByCmpnyCd;
module.exports.QSetInsNftBuy = fnSetInsNftBuy;
module.exports.QGetNftBankInfoRandom = fnGetNftBankInfoRandom;
module.exports.QUptMember = fnUptMember;
module.exports.QGetNftBankInfo = fnGetNftBankInfo;
module.exports.QGetNftSellCnt = fnGetNftSellCnt;
module.exports.QInsMemberBankLog = fnInsMemberBankLog;
module.exports.QGetMemberWalletLimit1 = fnGetMemberWalletLimit1;
module.exports.QGetNftBuyList = fnGetNftBuyList;
module.exports.QUptBuyStatus = fnUptBuyStatus;
module.exports.QUptNftBuyStatus = fnUptNftBuyStatus;
module.exports.QGetFaqList = fnGetFaqList;
module.exports.QGetNoticeList = fnGetNoticeList;
module.exports.QGetSubNoticeList = fnGetSubNoticeList;
module.exports.QGetSubNoticeListCnt = fnGetSubNoticeListCnt;
module.exports.QgetNftSellInfo = fngetNftSellInfo;
module.exports.QGetNftListByAirdrop = fnGetNftListByAirdrop;