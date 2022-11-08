
const Hogan = require("hogan.js");
const fs = require("fs")
const async = require("async");
const transporter = require('../sendmail')();

exports.send = function(to,randomKey,type,callback){
  async.waterfall(
      [
          function (callback) {
            var emailTemplate = ""
            if(type == 'I') emailTemplate = process.cwd()+"/mail/findIDTemplete.html";
            else emailTemplate = process.cwd()+"/mail/initPassTemplete.html";
           
            fs.readFile(emailTemplate, "utf8", function (err, templateData) {
              if(err) console.log(err)
              callback(null,templateData);
            });
          },
          function (templateData, callback) {
              var template,
                  body;
                  
              template = Hogan.compile(templateData);
              html = template.render({key: randomKey});
              var subject = 'WITHMONG 고객 정보 요청 메일';        
              transporter.mailSend(to,subject,html, function (err, result) {
                if(err) console.log(err);
                console.log(result);
                callback(null,result);
              });
          }
      ], function (err, result) {
          if(err) callback(err);
          else callback(null, result);
    });
};

