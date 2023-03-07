function fnGetMemTotal(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT count(1) totSum "
        sql += " FROM cs_member cm "
        // sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
        sql += " inner join cs_bank cb ON cm.m_seq = cb.m_seq "
        sql += " WHERE cm.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " AND cm.admin_grade != 'CMDT00000000000000'"
        if (param.memId) sql += " AND cm.mem_id = '" + param.memId + "'"
        if (param.text) {
            if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000021') sql += " AND cm.mem_hp like '%" + param.text + "%'"
        }
        sql += " order by cm.create_dt desc"

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

function fnGetMemList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cm.m_seq , cm.mem_id, cm.mem_pass, cm.salt, cm.mem_nm, cm.mem_hp, cm.mem_email, nation, fn_get_name(cm.nation) nation_name ,admin_grade, fn_get_name(cm.admin_grade) admin_grade_name, DATE_FORMAT(cm.create_dt, '%Y-%m-%d %H:%i:%s') create_dt "
        // sql += " , cw.coin_addr, cb.bank_info,cb.bank_acc,cb.acc_nm, concat(cb.bank_info,' ',cb.bank_acc,' ',cb.acc_nm) banks "
        sql += " , cb.bank_info,cb.bank_acc,cb.acc_nm, concat(cb.bank_info,' ',cb.bank_acc,' ',cb.acc_nm) banks "
        sql += " FROM cs_member cm "
        // sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
        sql += " inner join cs_bank cb ON cm.m_seq = cb.m_seq "
        sql += " WHERE cm.cmpny_cd = '" + param.cmpnyCd + "'"
        sql += " AND cm.admin_grade != 'CMDT00000000000000'"
        if (param.memId) sql += " AND cm.mem_id = '" + param.memId + "'"
        if (param.text) {
            if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%" + param.text + "%'"
            else if (param.srchOption == 'CMDT00000000000021') sql += " AND cm.mem_hp like '%" + param.text + "%'"
        }
        sql += " order by cm.create_dt desc"
        sql += " limit " + (param.pageIndex - 1) * 10 + "," + param.rowsPerPage

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

function fnSetMember(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_member"
        sql += " (m_seq, cmpny_cd, mem_id, mem_pass, salt, mem_nm, mem_hp, mem_email, nation, nft_status, auth_yn) "
        sql += " VALUES('" + param.mSeq + "', '" + param.cmpnyCd + "', '" + param.memId + "', '" + param.memPass + "', '" + param.salt + "' "
        sql += " , '" + param.memNm + "' , '" + param.memHp + "', '" + param.memEmail + "', (select cmm_dtl_cd from tb_comm_cd_dtl where cmm_dtl_desc ='" + param.nation + "'),'"+param.nftStatus+"','"+param.authYn+"')"

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

function fnSetWallet(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_wallet"
        sql += " (m_seq, coin_typ, coin_addr, coin_pk, key_id, krn, public_key) "
        sql += " VALUES('" + param.mSeq + "', '" + param.coinTyp + "', '" + param.cmpnyAddr + "', '" + param.cmpnyPk + "','"+ param.key_id+"','"+ param.krn+"','"+ param.public_key+"')"

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

function fnSetBank(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_bank"
        sql += " (m_seq, bank_info, bank_acc, acc_nm, bank_cd) "
        sql += " VALUES('" + param.mSeq + "', '" + param.bankInfo + "', '" + param.bankAcc + "', '" + param.accNm + "','" + param.bank_code + "')"

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
        var sql = " UPDATE cs_member SET"
        sql += " update_dt = CURRENT_TIMESTAMP  "
        if (!param.memPass == "") {
            sql += " , mem_pass = '" + param.memPass + "', salt = '" + param.salt + "' "
        }
        if (!param.memNm == "") {
            sql += " ,mem_nm = '"+param.memNm+"'";
        }
        if (!param.memHp == "") {
            sql += " ,mem_hp = '"+param.memHp+"'";
        }
        if (!param.nation == "") {
            sql += " ,nation = '"+param.nation+"'";
        }
        if (!param.authYn == "") {
            sql += " ,auth_yn = '"+param.authYn+"'";
        }
        if (!param.userNm == "") {
            sql += " ,mem_nm = '"+param.userNm+"'";
        }
        if (!param.userEmail == "") {
            sql += " ,mem_email = '"+param.userEmail+"'";
        }
        sql += " where m_seq = '" + param.mSeq + "'";
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

function fnUptBank(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " UPDATE cs_bank SET"
        sql += " update_dt = CURRENT_TIMESTAMP , bank_info='" + param.bankInfo + "', bank_acc= '" + param.bankAcc + "', acc_nm = '" + param.accNm + "'"
        sql += " where m_seq = '" + param.mSeq + "'";
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

function fnGetWallet(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT coin_typ, fn_get_name(coin_typ) coin_typ_name, coin_addr , coin_pk"
        sql += " FROM cs_wallet "
        sql += " WHERE m_seq = '" + param.mSeq + "'"

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

function fnGetCoinBuyList(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT seq, m_seq, buy_num, pay_num, bonus, usd_cost, krw_cost, in_mthd, fn_get_name(in_mthd) in_mthd_name "
        sql += " , sell_sts, fn_get_name(sell_sts) sell_sts_name, DATE_FORMAT(create_dt, '%Y-%m-%d %H:%i:%s') create_dt "
        sql += " FROM " + param.cs_coin_sell
        sql += " WHERE m_seq = '" + param.mSeq + "'"

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

function fnGetConfig(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cpc.max_amt, cpc.min_amt, cpc.is_captcha, cpc.is_pause, cpc.site_url, cpc.login_text, cpc.pwd_text, cpc.found_text, cpc.company_nm, cpc.suspension_min, cpc.is_auto_suspension_view "
        sql += " , cc.sign_yn, cc.cmpny_cd"
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

function fnSetBalance(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = " INSERT INTO cs_balance_wallet"
        sql += " (m_seq, balance) "
        sql += " VALUES('" + param.mSeq + "', 0)  "

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

function fnSetNftCollection(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "insert into cs_nft_collection (m_seq, wallet_seq) values";
        sql += " ('"+param.mSeq+"','"+param.walletSeq+"')";

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

function fnSetNftKcy(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "insert into cs_nft_kyc (m_seq, kyc_yn) values";
        sql += " ('"+param.mSeq+"','"+param.kycYn+"')";

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

function fnSetCreater(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql = "";
        sql += "insert into cs_nft_creater (m_seq) values";
        sql += " ('"+param.mSeq+"')";

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

function fnGetMemberInfo(param ,conn) {
    return new Promise(function (resolve, reject) {
        var sql = " SELECT cm.m_seq user_seq, cm.mem_id user_id, cm.mem_nm user_name, cm.mem_email user_email, cm.mem_hp user_phone "
        sql += " , fn_get_name(cm.nation) user_nation_name , DATE_FORMAT(fn_get_time(cm.create_dt), '%Y-%m-%d') create_date "
        sql += " , ifnull(cb.bank_info,'') user_bank, ifnull(cb.bank_acc,'') user_num, ifnull(cb.acc_nm,'') user_holder, concat(cb.bank_info,' ',cb.bank_acc,' ',cb.acc_nm) banks "
        sql += " FROM cs_member cm "
        // sql += " inner join cs_company cc ON cm.cmpny_cd = cm.cmpny_cd "
        // sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
        sql += " left join cs_bank cb ON cm.m_seq = cb.m_seq "
        sql += " WHERE cm.mem_id  = '" + param.memId + "'"
        sql += " AND cm.cmpny_cd  = '" + param.cmpnyCd + "'"
        sql += " AND cm.admin_grade = 'CMDT00000000000000'"

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

function fnInsCertNum(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "insert into cs_nft_sms (mem_hp, auth_code, auth_yn) values";
        sql += " ('"+param.hp+"','"+param.auth_code+"','"+param.auth_yn+"')"

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

function fnGetCertNum(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select seq, mem_hp, auth_code, auth_yn from cs_nft_sms";
        sql += " where 1=1";
        sql += " and seq ='"+param.seq+"'";

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

function fnUptCertYn(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "update cs_nft_sms set";
        sql += " auth_yn = '"+param.auth_yn+"'";
        sql += " where 1=1";
        sql += " and seq ='"+param.seq+"'";

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

function fnInsBankAuth(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "insert into cs_bank_auth (bank_code, bank_acc, acc_nm, verifyTrDt, verifyTrNo) values";
        sql += " ('" + param.bankCode + "','" + param.acctNo + "','" + param.custNm + "','" + param.verifyTrDt +"','" + param.verifyTrNo+ "')";

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

function fnGetBankAuth(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select seq, bank_code, bank_acc, acc_nm, verifyTrDt, verifyTrNo, auth_yn, create_dt from cs_bank_auth";
        sql += " where 1=1";
        sql += " and auth_yn = 'N'";
        sql += " and use_yn = 'Y'";
        sql += " and bank_code = '" + param.bank_code + "'";
        sql += " and bank_acc = '" + param.bank_acc + "'";
        sql += " and acc_nm = '" + param.acc_nm + "'";

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

function fnGetBankAuthInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "select seq, bank_code, bank_acc, acc_nm, verifyTrDt, verifyTrNo, auth_yn, create_dt from cs_bank_auth";
        sql += " where 1=1";
        sql += " and seq = '" + param.seq + "'";

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

function fnDelBankAuth(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "delete from cs_bank_auth"
        sql += " where 1=1";
        sql += " and seq = '" + param.seq + "'";

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

function QUptBankAuth(param, conn) {
    return new Promise(function (resolve, reject) {
        let sql = "";
        sql += "update cs_bank_auth set"
        sql += " update_dt = NOW()";
        if (param.auth_yn != '' && param.auth_yn != null) {
            sql += " ,auth_yn = '" + param.auth_yn + "'";
        }
        if (param.use_yn != '' && param.use_yn != null) {
            sql += " ,use_yn = '" + param.use_yn + "'";
        }
        sql += " where 1=1";
        sql += " and seq = '" + param.seq + "'";

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


function fnInsBankCertification(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql =" INSERT INTO cs_bank_certification "
        sql += " (bank_info, bank_acc, acc_nm, cert_text, cert_yn, create_dt, update_dt, bank_cd, verify_tr_dt, verify_tr_no) "
        sql += " VALUES('"+param.bank_info+"', '"+param.bank_acc+"', '"+param.acc_nm+"', '"+param.verify_txt+"', 'N', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,'"+param.bank_code+"','"+param.verify_tr_dt+"','"+param.verify_tr_no+"') "


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



function fnGetBankCertification(param, conn) {
    return new Promise(function (resolve, reject) {
        var sql =" select seq, verify_tr_dt, verify_tr_no, bank_cd, bank_acc, acc_nm "
        sql += " from cs_bank_certification cbc  "
        sql += " WHERE seq  = '"+param.seq+"' order by create_dt desc limit 1"

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

function fnUptBankCertification(param, conn) {
    return new Promise(function (resolve, reject) {

        var sql =" UPDATE cs_bank_certification "
        sql += " SET cert_yn = 'Y' "
        sql += " WHERE seq = '"+param.seq+"' "


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
        var sql = " SELECT max_amt, min_amt, is_captcha, is_pause, site_url, login_text, pwd_text, found_text, cmpny_cd, company_nm, suspension_min, is_auto_suspension_view  "
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

module.exports.QGetMemTotal = fnGetMemTotal;
module.exports.QGetMemberList = fnGetMemList;
module.exports.QSetMember = fnSetMember;
module.exports.QSetWallet = fnSetWallet;
module.exports.QSetBank = fnSetBank;

module.exports.QUptMember = fnUptMember;
module.exports.QUptBank = fnUptBank;

module.exports.QGetWallet = fnGetWallet;
module.exports.QGetCoinBuyList = fnGetCoinBuyList;
module.exports.QGetConfig = fnGetConfig;
module.exports.QSetBalance = fnSetBalance;
module.exports.QSetNftCollection = fnSetNftCollection;
module.exports.QSetNftKcy = fnSetNftKcy;
module.exports.QSetCreater = fnSetCreater;
module.exports.QGetMemberInfo = fnGetMemberInfo;
module.exports.QInsCertNum = fnInsCertNum;
module.exports.QGetCertNum = fnGetCertNum;
module.exports.QUptCertYn = fnUptCertYn;
module.exports.QInsBankAuth = fnInsBankAuth;
module.exports.QGetBankAuth = fnGetBankAuth;
module.exports.QGetBankAuthInfo = fnGetBankAuthInfo;
module.exports.QDelBankAuth = fnDelBankAuth;
module.exports.QUptBankAuth = QUptBankAuth;

module.exports.QInsBankCertification = fnInsBankCertification;
module.exports.QGetBankCertification = fnGetBankCertification;
module.exports.QUptBankCertification = fnUptBankCertification;

module.exports.QGetConfigInfo = fnGetConfigInfo;
