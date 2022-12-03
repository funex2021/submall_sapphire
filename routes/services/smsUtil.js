const axios = require('axios');

const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');
const smsUrl = properties.get('com.sms.url');
const smsKey = properties.get('com.sms.key');

const path = require('path');
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))

//api 호출 함수
//_url : 호출할 api url
//_data : type = object , api 호출 param
//_contentType : content-type 변경 필요시에만 작성
function fnSmsApiCall(_data){
    return new Promise(function (resolve, reject) {

        let config = {
            method: 'post' ,
            url: smsUrl,
            headers: {
                'Content-Type': 'application/json' ,
                'apiKey'      : smsKey,
            },
            data : _data
        }

        let rtnRes = {
            res : false,
            code : "500",
            message : "접속량이 많아 지연되고있습니다.",
            error : "",
            data : "",
        }

        console.log('call sms ' , smsUrl);
        console.log('params ' , _data);

        axios(config).then(function (response) {
            if(response.data){
                rtnRes = response.data;
                resolve(rtnRes);
            }else{
                reject(rtnRes);
            }
        }).catch(function (error) {
            logUtil.errObj("sms error", error)
            rtnRes.error = error;
            reject(rtnRes);
        });
    });
}

module.exports.fnSmsApiCall = fnSmsApiCall;