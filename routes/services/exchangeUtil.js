const axios = require('axios');
const path = require('path');
const Mydb = require(path.join(process.cwd(),'/routes/config/mydb'))

//환율 호출 함수
var fnGetExchangeRate = async function (req, res, next) {
    return new Promise(async function (resolve, reject) {

        let pool = req.app.get('pool');
        let mydb = new Mydb(pool);
        try {  
            mydb.execute(async conn => {
                let myExchange = await fnGetExchangeInfo(conn);
                console.log('myExchange.length : ', myExchange.length)
                if(myExchange.length == 0) {
                    let exchangeInfo = await axios.get('https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD');
                    console.log('exchangeInfo.data : ', exchangeInfo.data[0])
                    await fnInsExchangeInfo(exchangeInfo.data[0], conn)
                    conn.commit();
                    next();
                } else {
                    console.log('myExchange : ', myExchange)
                    if(myExchange[0].is_after < -6) {
                        let exchangeInfo = await axios.get('https://quotation-api-cdn.dunamu.com/v1/forex/recent?codes=FRX.KRWUSD');
                        console.log('exchangeInfo.data : ', exchangeInfo.data[0])
                        await fnInsExchangeInfo(exchangeInfo.data[0], conn)
                        conn.commit();
                    }
                    next();
                }
            });
        } catch (e) {
            console.log("isStatusCheck error : " + e.message);
            next(); 
        }
        
    });
}


function fnGetExchangeInfo(conn) {
    return new Promise(function (resolve, reject) {
      var sql =" SELECT seq, origin_rate, oper_rate, create_dt, update_dt, "
      sql +=" TIMESTAMPDIFF(hour, CURRENT_TIMESTAMP(), create_dt) is_after "
      sql += " FROM cs_exchange_rate order by create_dt desc limit 1"
    //   sql += " VALUES('"+param.cmpnyCd+"', '"+param.mSeq+"', '"+param.payCode+"', '"+param.payRequest+"', '"+param.payResponse+"', '"+param.userIp+"', '"+param.isSuccess+"')  "
      
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

  function fnInsExchangeInfo(param, conn) {
    return new Promise(function (resolve, reject) {
        console.log('param : ', param)
      var sql =" INSERT INTO cs_exchange_rate "
      sql += " (origin_rate, oper_rate, create_dt, update_dt) "
      sql += " VALUES ("+param.cashBuyingPrice+", CAST(("+param.cashBuyingPrice+" + 19) / 10 AS signed integer) * 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) "
      
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
module.exports.fnGetExchangeRate = fnGetExchangeRate;