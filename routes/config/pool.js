const mysql   = require("mysql"),
      util    = require('util'),
      Promise = require("bluebird");

Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

/*
* properties
*/
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('pay.properties');
const path = require("path");
const comUtil = require(path.join(process.cwd(), '/routes/services/comUtil'))

let host = "";
let user = "";
let pass = "";
let database = "";

if(comUtil.fnIsProd()){
  host = properties.get('com.db.host');
  user = properties.get('com.db.user');
  pass = properties.get('com.db.pass');
  database = properties.get('com.db.database');
}else{
  host = properties.get('dev.db.host');
  user = properties.get('dev.db.user');
  pass = properties.get('dev.db.pass');
  database = properties.get('dev.db.database');
}

const DB_INFO = {
  host     : host,
  user     : user,
  password : pass,
  database : database,
  multipleStatements: true,
  connectionLimit:50,
  waitForConnections:false
};

module.exports = class {
  constructor(dbinfo) {
    dbinfo = dbinfo || DB_INFO;
    this.pool = mysql.createPool(dbinfo);
  }

  connect() {
    return this.pool.getConnectionAsync().disposer(conn => {
      
      console.log("==========mysql release==============")
      return conn.release();
    });
  }

  end() {
    this.pool.end( function(err) {
      util.log(">>>>>>>>>>>>>>>>>>>>>>>>>>> End of Pool!!");
      if (err)
        util.log("ERR pool ending!!");
    });
  }
};
