var logUtil = {};
var SQL_LOG_VIEW = true;

logUtil.isView = function(st) {
  SQL_LOG_VIEW = st;
}

logUtil.logStart = function(msg){
  console.log("\n\n")
  console.log("=====log "+msg+" start======") 
};

logUtil.logEnd = function(title,msg,data){
  console.log("\n\n")
  console.log("=====log "+title+" end======") 
};

logUtil.logMsg = function(msg){
  console.log("\n\n")
  console.log(msg)
};

logUtil.logStr = function(title,msg,data){
  console.log("\n\n")
  console.log("=====log "+title+" start======") 
  console.log(msg,data)
  console.log("=====log "+title+" end======") 
};

logUtil.errObj = function(title,err){
  console.log("\n\n")
  console.log("=====log "+title+" start======") 
  let log = {
    code : err.code,
    message : err.message
  }
  console.log(log)
  console.log("=====log "+title+" end======") 
};

logUtil.logObj = function(title,data){
  console.log("\n\n")
  console.log("=====log "+title+" start======") 
  console.log(data)
  console.log("=====log "+title+" end======") 
};

logUtil.logSql = function(title,data){
  if(SQL_LOG_VIEW) {
    console.log("\n\n")
    console.log("=====log "+title+" start======") 
    console.log(data)
    console.log("=====log "+title+" end======") 
  }
};

module.exports = logUtil;
