const path = require("path")
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

const logUtil = require(path.join(process.cwd(),'/routes/services/logUtil'))
const encUtil = require(path.join(process.cwd(),'/routes/services/encUtil'))

const Mydb = require(path.join(process.cwd(),'/routes/config/mydb'))
const axios = require('axios');
var qs = require('qs');
var requestIp = require('request-ip');

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');
const cointable = properties.get('com.coin.cointable');
const tableVer = properties.get('com.table.version');

module.exports = (pool) => {
  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    console.log("passport.serializeUser call");
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    //console.log("passport.deserializeUser call");
    done(null, user); // 여기의 user가 req.user가 됨
  });
    
  // 로그인
  passport.use('local-Signin', new LocalStrategy({ // local-signin 라는 전략을짭니다.
    usernameField: 'memId',
    passwordField: 'memPass',
    session: true, // 세션에 저장 여부
    passReqToCallback: true // 인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
  }, async function(req, memId, memPass, done){
      var obj = {};
      obj.memId = memId;

      let pool = req.app.get('pool');
      let mydb = new Mydb(pool);
      

      //login log
      var logObj = {};
      logObj.cmpnyCd = ""; 
      logObj.mSeq = "";
      logObj.payCode = "login"; 
      logObj.payRequest = memId;
      logObj.userIp = requestIp.getClientIp(req); 
    
      mydb.executeTx( async conn =>  {
        try {
          let domain = req.headers.host;
          console.log('domain : ' + domain)
          obj.domain = domain;
          let config = await fnGetConfigInfo(obj, conn);

          console.log('config : ' + JSON.stringify(config))
          obj.cmpnyNm = config.company_nm;
          
          let memInfo = await fnGetCompanyInfo(obj, conn);
          console.log('memInfo', memInfo);
          let user = {};
          if(memInfo.length > 0) {
            let checkPass = await encUtil.decodingPasswordHash(Buffer.from(memPass, "base64").toString('utf8'),memInfo[0].salt);
            let checkPass2 = await encUtil.decodingPasswordHash(memPass,memInfo[0].salt);
            if(checkPass == memInfo[0].mem_pass || checkPass2 == memInfo[0].mem_pass) {
       
              user.mSeq = memInfo[0].m_seq;
              user.memId = memInfo[0].mem_id;
              user.cmpnyCd = memInfo[0].cmpny_cd; //req.user.cmpnyCd; 
              user.memNm =memInfo[0].mem_nm;
              user.coinAddr = memInfo[0].coin_addr;
              user.bankSeq = memInfo[0].bank_seq;
              
              //ip check
              obj.cmpnyCd = memInfo[0].cmpny_cd;
              let ip = requestIp.getClientIp(req);
              console.log('ip : ' + ip)
              var ipList = await fnGetIpList(obj, conn);
              console.log('ipList : ' + JSON.stringify(ipList));
              var isContainsIP = true;
              for(i = 0; i < ipList.length; i++) {
                console.log('ipList[' + i + '].user_ip : ' + ipList[i].user_ip)
                if(ipList[i].user_ip == ip) isContainsIP = false;
              }
              if(!isContainsIP) {
                logObj.payResponse = '차단된 아이피 입니다.';
                logObj.isSuccess = "00"
                // logObj.cmpnyCd = domain;
                await fnSetHistory(logObj, conn);
                return done(null,null, { message: '차단된 아이피 입니다.'});
              }
              
              
              let companyName = config.company_nm;

              user.ucompanyName = companyName.toUpperCase();
              user.companyName = companyName;

              if(tableVer == 0) {
                user.cs_coin_sell = "cs_" + cointable + "_sell";
                user.cs_coin_trans = "cs_" + cointable + "_trans";
                user.cs_nft_sell = "cs_nft_sell";
                user.cs_nft_trans = "cs_nft_trans";
              } else {
                user.cs_coin_sell = "cs_" + cointable + "_sell_"+companyName;
                user.cs_coin_trans = "cs_" + cointable + "_trans_"+companyName;
                user.cs_nft_sell = "cs_nft_sell_"+companyName;
                user.cs_nft_trans = "cs_nft_trans_"+companyName;
              }

              logObj.mSeq = memInfo[0].m_seq;
              logObj.cmpnyCd = memInfo[0].cmpny_cd;
              logObj.payResponse = "login seccess"
              logObj.isSuccess = "01"
              await fnSetHistory(logObj, conn);

              done(null, user);
              
            } else {
              logObj.payResponse = '비밀번호가 일치 하지 않습니다.' 
              logObj.isSuccess = "00"
              // logObj.cmpnyCd = domain;
              await fnSetHistory(logObj, conn);
              console.log('비밀번호가 일치 하지 않습니다.')
              return done(null,null, { message: '비밀번호가 일치 하지 않습니다.'});
            }
          } else {
            logObj.payResponse = '존재하지 않은 아이디입니다. ID를 확인해 주세요'
            logObj.isSuccess = "00"
            // logObj.cmpnyCd = domain;
            await fnSetHistory(logObj, conn);
            console.log('존재하지 않은 아이디입니다. ID를 확인해 주세요')
            return done(null,user, { message: '존재하지 않은 아이디입니다. ID를 확인해 주세요' });
          }
        } catch (e) {
          return done(e)        }
               
      })   
      
  }));


  /*
  * 회원조회
  */
  function fnGetCompanyInfo(param, conn) {
    return new Promise(function (resolve, reject) {
      var sql =" SELECT cm.m_seq , cm.mem_id, cm.cmpny_cd, cm.mem_pass, cm.salt, cm.mem_nm, cm.mem_hp "
      sql += " , cm.mem_email, nation, fn_get_name(cm.nation) nation_name , DATE_FORMAT(cm.create_dt, '%Y-%m-%d %H:%i:%s') create_dt "
      sql += " , cm.bank_seq";
      // sql += " ,cw.coin_addr, cw.coin_pk "
      // sql += " FROM cs_member cm inner join cs_wallet cw ON cw.m_seq = cm.m_seq "
      sql += " FROM cs_member cm"
      sql += " WHERE cm.mem_id = '"+param.memId+"'"
      sql += " and cm.mem_status = 'CMDT00000000000030' "
      sql += " and cm.cmpny_cd = (select cmpny_cd from cs_company where cmpny_nm = '"+param.cmpnyNm+"' )"
      
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
}

function fnSetHistory(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" INSERT INTO cs_pay_history"
    sql += " (cmpny_cd, m_seq, pay_code, pay_request, pay_response, user_ip, is_success) "
    sql += " VALUES('"+param.cmpnyCd+"', '"+param.mSeq+"', '"+param.payCode+"', '"+param.payRequest+"', '"+param.payResponse+"', '"+param.userIp+"', '"+param.isSuccess+"')  "
    
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
function fnGetIpList(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" SELECT user_ip "
    sql += " FROM cs_block_ip  " 
    sql += " WHERE cmpny_cd = '"+param.cmpnyCd+"'"
    sql += " AND delete_yn = 'N'"
    
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
    var sql =" SELECT max_amt, min_amt, is_captcha, is_pause, site_url, login_text, pwd_text, found_text, company_nm, suspension_min, is_auto_suspension_view  "
    sql += " FROM cs_pay_config "  
    sql += " WHERE site_url = '"+param.domain+"'" 
    
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
