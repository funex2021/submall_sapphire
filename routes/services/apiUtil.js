const axios = require('axios');
const qs = require('qs');

const path = require('path');

const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');
const devUrl = properties.get('dev.api.url');
const apiUrl = properties.get('com.api.url');
const comUtil = require(path.join(process.cwd(), '/routes/services/comUtil'))

const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))

//api 호출 함수
//_url : 호출할 api url
//_data : type = object , api 호출 param
//_contentType : content-type 변경 필요시에만 작성
function fnApiCall(_url, _data, _contentType , _methodType){
    return new Promise(function (resolve, reject) {
        let dataObj = {
            ..._data
        };

        let contentType = 'application/x-www-form-urlencoded';
        if(_contentType != null && _contentType != ''){
            contentType = _contentType;
        }

        let callApiUrl = devUrl;
        if(comUtil.fnIsProd){
            callApiUrl = apiUrl;
        }

        let methodType = 'post';
        if(_methodType != null && _methodType != ''){
            methodType = _methodType;
        }

        let config = {
            method: methodType ,
            url: callApiUrl + _url,
            headers: {
                'Content-Type': contentType ,
                // 'apiKey'      : '7SpZ6gWBGFKmfPfnTs_BiCgpAfO6XEAdZkEKiK1AD8o',
            },
            data : qs.stringify(dataObj)
        }

        let rtnRes = {
            res : false,
            code : "500",
            message : "접속량이 많아 지연되고있습니다.",
            error : "",
            data : "",
        }

        if(_url != '/getBalance') {
            console.log('call api url ' , callApiUrl + _url);
            console.log('params ' , _data);
        }

        axios(config).then(function (response) {
            if(response.data){
                if(_url != '/getBalance') {
                    console.log('api res ', response.data);
                }
                rtnRes = response.data;
                if(response.data.code == '500' || response.data.code == '504' || response.data.code == '404'){
                    rtnRes.message = "접속량이 많아 지연되고있습니다.";
                }
                resolve(rtnRes);
            }else{
                reject(rtnRes);
            }
        }).catch(function (error) {
            logUtil.errObj("api call error", error)
            rtnRes.error = error;
            reject(rtnRes);
        });
    });
}

module.exports.fnApiCall = fnApiCall;