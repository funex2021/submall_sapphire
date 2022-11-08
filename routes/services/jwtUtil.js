const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const rtnUtil = require('./rtnUtil')
const path = require('path');
const logUtil = require('./logUtil')
/*
 * JWT 토큰 발급과 재발급 로직
 * 최초 발급시 Access Token과 Refresh Token 을 발급합니다. 그 후 Access Token으로 API를 사용하다가 만료시간이 지나면 만료시간을 길게 준 Refresh Token을 이용해서 Access Token을 재발급 합니다.
 * 클라이언트가 토큰의 만료시간을 알 수 있기 때문에 클라이언트에서 판단하여 만료시간이 넘었으면 토큰 재발급을 요청하거나 TokenExpiredError가 발생했을 때 재발급해주는 것입니다.
 */

var jwtUtil = {};

/**
 * JWT Create RefreshToken
 * @param {any} payload 
 * @param {password salt} salt 
 * @returns {string} RefreshToken
 */
//refreshToken 생성
jwtUtil.generateRefreshToken = async (userId, salt) => {
  try {
    const payload = {
      sub: userId
    }
    // 1초 = 1,000ms (1*1000)
    // 1분 = 60,000ms (60*1000)
    // 1시간 = 3,600,000ms (60*60*1000)
    // 1일 = 86,400,000ms (24*60*60*1000)
    // JWT 1000 을 곱하지 않는다 기본 단위
    var options = {
      expiresIn: 24 * 60 * 60
    }; //1일
    return await jwt.sign(payload, salt, options)
  } catch (err) {
    throw err
  }
}

//refreshToken 검증
jwtUtil.verifyRefreshToken = async (accessToken, refreshToken, salt) => {
  try {
    const payload = await jwt.verify(accessToken, publicKey, {
      algorithms: 'RS256',
      ignoreExpiration: true
    })
    if (payload.type === 'email') {
      await jwt.verify(refreshToken, salt, {
        algorithms: 'HS256'
      })
      return await jwtUtil.createAccessToken(payload)
    } else {
      throw 'accessToken type should be email type'
    }
  } catch (e) {
    throw {
      status: 401,
      message: e
    }
  }
}

/**
 * JWT Create AccessToken
 * @param {any} payload 
 * @param {password salt} salt 
 * @returns {string} accessToken
 */
//비대칭키 암호화 RS256
jwtUtil.generateAccessToken = async (userId) => {
  try {
    const payload = {
      sub: userId
    }

    let secretKey = crypto.createHash('sha512').update(userId).digest('base64').replace(/[^A-Za-z0-9]/g, '')

    var options = {
      expiresIn: 60 * 5
    }; //60*60 1시간 // 5*60 5분 기준으로 변경 //60 1분 
    return await jwt.sign(payload, secretKey, options)
  } catch (err) {
    throw err
  }
}

jwtUtil.updateAccessToken = async (req) => {
  try {
    let token = req.headers['access_token']
    console.log("updateAccessToken -->", token)
    let userId = await jwt.decode(token, {
      complete: true
    }).payload.sub;
    //console.log("updateAccessToken -->", userId)
    const payload = {
      sub: userId
    }
    let secretKey = crypto.createHash('sha512').update(userId).digest('base64').replace(/[^A-Za-z0-9]/g, '')
    let options = {
      expiresIn: 60 * 5
    }; // 5분 기준으로 변경 //60 1분 
    return await jwt.sign(payload, secretKey, options)
  } catch (err) {
    //console.log("updateAccessToken ERR")
    throw err
  }
}

// middlewares
jwtUtil.isVerify = async (req, res, next) => {
  let token = ''
  let id = ''

  // token does not exist
  try {
    token = req.headers['access_token']

    id = await jwt.decode(token, {
      complete: true
    }).payload.sub;

    if (!token) {
      logUtil.logObj("isVerity ", " if(!token) Check ")
      return res.json(rtnUtil.successTrue('accessToken 검증시 실패 하였습니다', {
        code: 401,
        data: ''
      }))
    }

    let secretKey = crypto.createHash('sha512').update(id).digest('base64').replace(/[^A-Za-z0-9]/g, '')


    const p = new Promise(
      async () => {
        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
            logUtil.logObj("jwtUtil > isVerity return ", err.message)
            res.json(rtnUtil.successFalse({
              code: 401,
              data: ''
            }, 'accessToken 검증시 실패 하였습니다'))
          } else {
            next();
          }

        })
      }
    )

  } catch (err) {
    logUtil.logObj("isVerity chatch", err.message)
    res.json(rtnUtil.successFalse({
      code: 401,
      data: ''
    }, 'accessToken 검증시 실패 하였습니다'))
  }
};



// middlewares
jwtUtil.getId = async (req) => {
  return new Promise(async function (resolve, reject) {
    let token = ''
    let id = ''

    // token does not exist
    try {
      token = req.headers['access_token']
      //console.log(token)
      id = await jwt.decode(token, {
        complete: true
      }).payload.sub;
      //console.log("access Id ::", id)
      resolve(id)
    } catch (err) {
      //console.log(err)
      reject(err)

    }
  });
}

module.exports = jwtUtil;
