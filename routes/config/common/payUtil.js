const moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");
const path = require('path');
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const Mydb = require(path.join(process.cwd(),'/routes/config/mydb'))
var requestIp = require('request-ip');
const PropertiesReader = require("properties-reader");
const properties = PropertiesReader('pay.properties');
const localUrl = properties.get('com.local.url');

var isStatusCheck = async function (req, res, next) {

  console.log('isStatusCheck!!')
  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  let obj = {};
  
  obj.memId = req.user.memId;
  obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd; 

  try {  
    mydb.execute(async conn => {
      let domain = '';
      if(req.headers.host.indexOf('localhost') > -1){
        domain = localUrl;
      }else{
        domain = req.headers.host;
      }


      obj.domain = domain;
      let config = await fnGetConfigInfo(obj, conn);
      console.log('config : ' + JSON.stringify(config))
      if(config != null && config.is_auto_suspension_view == 'Y') {
        try {  
          let mem_status = await fnGetStatus(obj, conn);
          if(mem_status == 'CMDT00000000000029') {
            let domain = '';
            if(req.headers.host.indexOf('localhost') > -1){
              domain = localUrl;
            }else{
              domain = req.headers.host;
            }
      
            obj.domain = domain;
            res.render("login",{'alertMessage':'회원 정지 되었습니다.', 'config':config, 'userId':''})
            return;
          } else {
            let result = await fnGetShowAccount(obj, conn);
            if(result.length > 0) {
              console.log('view_time : ' + result[0].view_time);

              console.log('moment().format("YYYY-MM-DD HH:mm:ss") : ' + moment().format("YYYY-MM-DD HH:mm:ss"));

              let now = moment();//.format("HH:mm:ss");
              let viewTime = moment(result[0].view_time, "YYYY-MM-DD HH:mm:ss");//.format("HH:mm:ss");

              console.log('now : ' + now);
              console.log('viewTime : ' + viewTime);

              let diff = moment(now).diff(viewTime, "second");
              console.log('분 차이: ', diff / 60);
              diff = diff >= 86400 ? diff % 86400 : diff;
              console.log('diff : ', diff);
              if(parseInt(config.suspension_min) * 60 < diff) { //suspension_min분 동안 구매가 없을 시 
              //if(60 < diff) {//test 1분
                obj.memStatus = 'CMDT00000000000029';
                await fnSetMemStatus(obj, conn);
                await fnSetIsBuy(obj, conn);
                var logObj = {};
                logObj.cmpnyCd = req.user.cmpnyCd;
                logObj.mSeq = req.user.mSeq;
                logObj.payCode = "자동회원정지"; 
                logObj.payRequest = req.user.memId;
                logObj.userIp = requestIp.getClientIp(req);
                logObj.payResponse = obj.memId+ " : -> 계좌 확인 후 자동회원정지 "
                logObj.isSuccess = "01"
                await fnSetHistory(logObj, conn);
                conn.commit(); 
                res.render("login",{'alertMessage':'회원 정지 되었습니다.', 'config':config, 'userId':''})
                return;
              } else {
                next();
              }
            } else {
              next();
            }
          }
        } catch (e) {
          console.log("isStatusCheck error : " + e.message);
          next();
        }
      } else {
        next();
      }
    });
    
  } catch (e) {
    console.log("isStatusCheck error : " + e.message);
    next();
  }

};

var isStatusCheckAjax = async function (req, res, next) {

  console.log('isStatusCheckAjax!!')

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  let obj = {};
  
  obj.memId = req.user.memId;
  obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd; 

  
  try {  
    mydb.execute(async conn => {
      let domain = '';
      if(req.headers.host.indexOf('localhost') > -1){
        domain = localUrl;
      }else{
        domain = req.headers.host;
      }

      obj.domain = domain;
      let config = await fnGetConfigInfo(obj, conn);
      if(config != null && config.is_auto_suspension_view == 'Y') {
        try {  
          let mem_status = await fnGetStatus(obj, conn);
          if(mem_status == 'CMDT00000000000029') {
              res.json(rtnUtil.successFalse("670", "회원 정지 되었습니다. 관리자에게 문의 하세요.","",""));
              return;
            } else {

            let result = await fnGetShowAccount(obj, conn);
            if(result.length > 0) {
              console.log('view_time : ' + result[0].view_time);

              console.log('moment().format("YYYY-MM-DD HH:mm:ss") : ' + moment().format("YYYY-MM-DD HH:mm:ss"));

              let now = moment();//.format("HH:mm:ss");
              let viewTime = moment(result[0].view_time, "YYYY-MM-DD HH:mm:ss");//.format("HH:mm:ss");

              console.log('now : ' + now);
              console.log('viewTime : ' + viewTime);

              let diff = moment(now).diff(viewTime, "second");
              console.log('분 차이: ', diff / 60);
              diff = diff >= 86400 ? diff % 86400 : diff;
              console.log('diff : ', diff);
              if(parseInt(config.suspension_min) * 60 < diff) { //suspension_min분 동안 구매가 없을 시 
              //if(1 < diff) {//test 1분
                obj.memStatus = 'CMDT00000000000029';
                await fnSetMemStatus(obj, conn);
                await fnSetIsBuy(obj, conn);
                var logObj = {};
                logObj.cmpnyCd = req.user.cmpnyCd;
                logObj.mSeq = req.user.mSeq;
                logObj.payCode = "자동회원정지"; 
                logObj.payRequest = req.user.memId;
                logObj.userIp = requestIp.getClientIp(req);
                logObj.payResponse = obj.memId+ " : -> 계좌 확인 후 자동회원정지 "
                logObj.isSuccess = "01"
                await fnSetHistory(logObj, conn);
                conn.commit(); 
                
                // let domain = req.headers.host;
                // console.log('domain : ' + domain)
                // obj.domain = domain;
                //let config = await fnGetConfigInfo(obj, conn);
                res.json(rtnUtil.successFalse("670", "회원 정지 되었습니다. 관리자에게 문의 하세요.","",""));
                //res.render("login",{'alertMessage':'회원 정지 되었습니다.', 'config':config, 'userId':''})
                return;
              } else {
                next();
              }
            } else {
              next();
            }
          }
        } catch (e) {
          console.log("isStatusCheck error : " + e.message);
          next();
        }
      } else {
        next();
      }
    });
  } catch (e) {
    console.log("isStatusCheck error : " + e.message);
    next();
  }
};
  

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

function fnGetStatus(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" SELECT mem_status FROM cs_member"
    sql += " WHERE cmpny_cd = '"+param.cmpnyCd+"' AND mem_id = '"+param.memId+"' "
    
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

function fnSetIsBuy(param, conn) {
  return new Promise(function (resolve, reject) {
    var sql =" UPDATE cs_account_show"
    sql += " SET is_buy = 'Y' "
    sql += " WHERE cmpny_cd = '"+param.cmpnyCd+"' AND mem_id = '"+param.memId+"' "
    
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

function fnGetShowAccount(param, conn) {
  return new Promise(function (resolve, reject) {
    
    var sql =" select DATE_FORMAT(fn_get_time(create_dt), '%Y-%m-%d %H:%i:%s') view_time from cs_account_show "
    sql += " WHERE cmpny_cd = '"+param.cmpnyCd+"' AND mem_id = '"+param.memId+"' AND is_buy = 'N' "
    sql += " order by create_dt limit 1  "

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

function fnSetMemStatus(param,conn) {
  return new Promise(function (resolve, reject) {
    var sql =" update cs_member set mem_status = '"+param.memStatus+"'"
    sql += " where cmpny_cd = '"+param.cmpnyCd+"' and mem_id = '"+param.memId+"'"
 
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
    //sql += " WHERE site_url LIKE '%"+param.domain+"%'"
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

module.exports.isStatusCheck =  isStatusCheck;
module.exports.isStatusCheckAjax = isStatusCheckAjax;
