
function fnGetMemTotal(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" SELECT count(1) totSum "
    sql += " FROM cs_member cm "
    sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
    sql += " inner join cs_bank cb ON cm.m_seq = cb.m_seq "   
    sql += " WHERE cm.cmpny_cd = '"+param.cmpnyCd+"'"
    sql += " AND cm.admin_grade != 'CMDT00000000000000'"
    if (param.memId) sql += " AND cm.mem_id = '"+param.memId+"'"
    if (param.text)  {
      if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%"+param.text+"%'"
      else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%"+param.text+"%'"
      else if (param.srchOption == 'CMDT00000000000021') sql += " AND cm.mem_hp like '%"+param.text+"%'"
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
    var sql =" SELECT cm.m_seq , cm.mem_id, cm.mem_pass, cm.salt, cm.mem_nm, cm.mem_hp, cm.mem_email, nation, fn_get_name(cm.nation) nation_name ,admin_grade, fn_get_name(cm.admin_grade) admin_grade_name, DATE_FORMAT(cm.create_dt, '%Y-%m-%d %H:%i:%s') create_dt "
    sql += " , cw.coin_addr, cb.bank_info,cb.bank_acc,cb.acc_nm, concat(cb.bank_info,' ',cb.bank_acc,' ',cb.acc_nm) banks "
    sql += " FROM cs_member cm "
    sql += " inner join cs_wallet cw ON cm.m_seq = cw.m_seq "
    sql += " inner join cs_bank cb ON cm.m_seq = cb.m_seq "   
    sql += " WHERE cm.cmpny_cd = '"+param.cmpnyCd+"'"
    sql += " AND cm.admin_grade != 'CMDT00000000000000'"
    if (param.memId) sql += " AND cm.mem_id = '"+param.memId+"'"
    if (param.text)  {
      if (param.srchOption == 'CMDT00000000000019') sql += " AND cm.mem_id like '%"+param.text+"%'"
      else if (param.srchOption == 'CMDT00000000000020') sql += " AND cm.mem_nm like '%"+param.text+"%'"
      else if (param.srchOption == 'CMDT00000000000021') sql += " AND cm.mem_hp like '%"+param.text+"%'"
    }
    sql += " order by cm.create_dt desc"
    sql += " limit "+(param.pageIndex-1)*10 +","+param.rowsPerPage

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
    var sql =" INSERT INTO cs_member"
    sql += " (m_seq, cmpny_cd, mem_id, mem_pass, salt, mem_nm, mem_hp, mem_email, nation) "
    sql += " VALUES('"+param.mSeq+"', '"+param.cmpnyCd+"', '"+param.memId+"', '"+param.memPass+"', '"+param.salt+"' "
    sql += " , '"+param.memNm+"' , '"+param.memHp+"', '', '"+param.nation+"')  "
    
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
    var sql =" INSERT INTO cs_wallet"
    sql += " (m_seq, coin_typ, coin_addr, coin_pk) "
    sql += " VALUES('"+param.mSeq+"', '"+param.coinTyp+"', '"+param.cmpnyAddr+"', '"+param.cmpnyPk+"')  "
    
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
    var sql =" INSERT INTO cs_bank"
    sql += " (m_seq, bank_info, bank_acc, acc_nm) "
    sql += " VALUES('"+param.mSeq+"', '"+param.bankInfo+"', '"+param.bankAcc+"', '"+param.accNm+"')  "
    
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
    var sql =" UPDATE cs_member SET"
    sql += " update_dt = CURRENT_TIMESTAMP  "
    if (!param.memPass == "") {
      sql += " , mem_pass = '"+param.memPass+"', salt = '"+param.salt+"' "
    }
    sql += " ,mem_nm ='"+param.memNm+"', mem_hp ='"+param.memHp+"', nation='"+param.nation+"'"
    sql += " where m_seq = '"+param.mSeq+"'";
    sql += " and cmpny_cd = '"+param.cmpnyCd+"'";
    
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
    var sql =" UPDATE cs_bank SET"
    sql += " bank_info='"+param.bankInfo+"', bank_acc= '"+param.bankAcc+"', acc_nm = '"+param.accNm+"'"
    sql += " where m_seq = '"+param.mSeq+"'";
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
    var sql =" SELECT coin_typ, fn_get_name(coin_typ) coin_typ_name, coin_addr , coin_pk"
    sql += " FROM cs_wallet "  
    sql += " WHERE m_seq = '"+param.mSeq+"'"
    
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
    var sql =" SELECT seq, m_seq, buy_num, pay_num, bonus, usd_cost, krw_cost, in_mthd, fn_get_name(in_mthd) in_mthd_name "
    sql += " , sell_sts, fn_get_name(sell_sts) sell_sts_name, DATE_FORMAT(create_dt, '%Y-%m-%d %H:%i:%s') create_dt "
    sql += " FROM "+param.cs_coin_sell  
    sql += " WHERE m_seq = '"+param.mSeq+"'"
    
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



module.exports.QGetMemTotal = fnGetMemTotal;
module.exports.QGetMemberList = fnGetMemList;
module.exports.QSetMember = fnSetMember;
module.exports.QSetWallet = fnSetWallet;
module.exports.QSetBank = fnSetBank;

module.exports.QUptMember = fnUptMember;
module.exports.QUptBank = fnUptBank;

module.exports.QGetWallet = fnGetWallet;
module.exports.QGetCoinBuyList = fnGetCoinBuyList;



