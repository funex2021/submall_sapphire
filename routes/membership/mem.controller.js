const path = require('path');
const Mydb = require(path.join(process.cwd(), '/routes/config/mydb'))
const Query = require('./mem.sqlmap'); // 여기
const rtnUtil = require(path.join(process.cwd(), '/routes/services/rtnUtil'))
const logUtil = require(path.join(process.cwd(), '/routes/services/logUtil'))
const encryption = require(path.join(process.cwd(), '/routes/services/encUtil'));
const CONST = require(path.join(process.cwd(), '/routes/services/const'));
const axios = require('axios')


const { v4: uuidv4 } = require('uuid');


exports.mview = async (req, res, next) => {  
  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  let {srchOption,srchText,pageIndex} = req.body;

  let search = {};
  search.option = srchOption;
  if ( srchOption == "") search.text = "";
  else search.text = srchText;

  let obj = {};
  
  obj.mainAdmin = false;
  obj.memId = "";
  obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd; 
  obj.srchOption = srchOption;
  obj.text = srchText;

  mydb.execute(async conn => {
    try {   
      
      let totalPageCount = await Query.QGetMemTotal(obj, conn);
    
      if (pageIndex == "" || pageIndex == null) {
        pageIndex = 1;
      };
    
      let pagination = {};
      pagination.rowsPerPage = 20;//페이지당 게시물 수
      pagination.totalItems = 0;//전체 게시물 숫자 
      pagination.pageListSize = 5;//페이지 숫자 버튼 개수
      pagination.pageIndex = pageIndex//현재페이지 
      pagination.totalPage = Math.ceil(totalPageCount.totSum / parseInt(pagination.rowsPerPage));  //전체 페이지 수 
      pagination.totalSet = Math.ceil(pagination.totalPage /  pagination.pageListSize);    //전체 세트수
      pagination.curSet = Math.ceil(pageIndex /  pagination.pageListSize) // 현재 셋트 번호
      pagination.startPage = ((pageIndex - 1) *  pagination.pageListSize) + 1 //현재 세트내 출력될 시작 페이지;
      pagination.endPage = (pagination.startPage +  pagination.pageListSize) - 1; //현재 세트내 출력될 마지막 페이지;
      logUtil.logObj(" 회원 리스트 pagination ", pagination)
     
      obj.pageIndex = pageIndex;
      obj.rowsPerPage = pagination.rowsPerPage;
      let memList = await Query.QGetMemberList(obj, conn);
       
      let basicInfo = {}
      basicInfo.title = '회원 관리';
      basicInfo.menu = 'MENU00000000000004';
      basicInfo.rtnUrl = 'membership/index';
      basicInfo.memList = memList;
      basicInfo.search = search;
      basicInfo.pagination = pagination;

      req.basicInfo = basicInfo;

      next();
    } catch (e) {
      logUtil.errObj("lecture.controller view", e)  
      next(e);  
    }
  });

  
}

exports.mins = async (req, res, next) => {
  let { 
        mSeq,
        memId,
        memName,
        memPW1,
        memHp, 
        bankInfo,
        memNation,
        bankAcc,
        accNm } = req.body;
   
  let tronInfo = await tron.newAddress();

  let obj = {};
  
  obj.cmpnyCd = req.user.cmpnyCd; //req.user.cmpnyCd; 
  obj.memId = memId;
  
  obj.memNm = memName;
  obj.memHp = memHp;
  obj.nation = memNation;
  obj.bankInfo = bankInfo;
  obj.bankAcc = bankAcc;
  obj.accNm = accNm;
  obj.coinTyp = 'CMDT00000000000018';
  obj.cmpnyAddr = tronInfo.address;
  obj.cmpnyPk = tronInfo.privateKey;

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  mydb.executeTx(async conn => {
    try {   
      if (mSeq == '') {
        obj.mSeq = uuidv4();
        let passInfo = await encryption.createPasswordHash(Buffer.from(memPW1, "base64").toString('utf8')); 
        obj.memPass = passInfo.password;
        obj.salt = passInfo.salt;

        await Query.QSetMember(obj,conn);
        conn.commit();
        await Query.QSetWallet(obj,conn);
        conn.commit();
        await Query.QSetBank(obj,conn);
        conn.commit();
      } else {
        //update
        obj.mSeq = mSeq;
        if (memPW1 != '') {
          obj.memPass = passInfo.password;
          obj.salt = passInfo.salt;
        }

        await Query.QUptMember(obj,conn);
        await Query.QUptBank(obj,conn);
      }
      

      conn.commit();
      res.json(rtnUtil.successTrue("", ""));
      
    } catch (e) {
      conn.rollback();
      logUtil.errObj("회원 등록", e)  
      res.json(rtnUtil.successFalse("", "")); 
    }
  });
}

exports.coinInfo = async (req, res, next) => {
  let {mSeq} = req.body;
   
  let obj = {};
  obj.mSeq = mSeq;  

  let pool = req.app.get('pool');
  let mydb = new Mydb(pool);

  mydb.executeTx(async conn => {
    try {   
      let coinInfo = await Query.QGetWallet(obj,conn);
      let unitCoinInfo = {};
      unitCoinInfo.address = coinInfo[0].coin_addr;
      let start = new Date().getTime();

      let tronInfo = await axios.get(CONSTS.API.URL+'/public/balance/'+coinInfo[0].coin_addr);

      unitCoinInfo.coin = tronInfo.data.data.coin;
      unitCoinInfo.token = tronInfo.data.data.token;
      let elapsed = new Date().getTime() - start;
      console.log("coin 시간 측정 ::::",elapsed)
      let coinHistory =  await Query.QGetCoinBuyList(obj,conn);
     
      res.json(rtnUtil.successTrue("", {'coinInfo':unitCoinInfo,'coinHistory':coinHistory}));
      
    } catch (e) {
      conn.rollback();
      logUtil.errObj("회원 등록", e)  
      res.json(rtnUtil.successFalse("", "")); 
    }
  });
}