var rtnUtil = {};

rtnUtil.successTrue = function(msg,data){
  return {
    success:true,
    message:msg,
    errors:null,
    data:data
  };
};

rtnUtil.successFalse = function(_code, _msg, _err, _data){

  return {
    success:false,
    code:_code,
    message:_msg,
    errors:_err,
    data:_data
  };
};

rtnUtil.parseError = function(errors){
  var parsed = {};
  if(errors.name == 'ValidationError'){
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
    }
  } else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
    parsed.username = { message:'This username already exists!' };
  } else {
    parsed.unhandled = errors;
  }
  return parsed;
};


module.exports = rtnUtil;
