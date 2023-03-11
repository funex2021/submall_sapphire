const path = require('path');
const fs = require("fs");
const os = require('os');

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');

function fnIsProd(){
    let isProd = false;
    if(os.type() == 'Linux'){
        try{
            const status = fs.readFileSync('/home/status.txt' , 'utf8');
            let lineArray = status.toString().split('\n');
            if(lineArray) {
                if (lineArray[0] == 'prod') {
                    isProd = true;
                    return(isProd);
                }
            }
        }catch (e){
            console.log(e);
            return(isProd);
        }
    }else{
        return(isProd);
    }
}


module.exports.fnIsProd = fnIsProd;