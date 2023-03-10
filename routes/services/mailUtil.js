const axios = require("axios");
const nodemailer = require("nodemailer");

/*
 * properties
 */
const PropertiesReader = require("properties-reader");
const properties = PropertiesReader("pay.properties");
const mailUser = properties.get("mail.user");
const mailPw = properties.get("mail.pw");
const contactUser = properties.get("mail.contact.user");
const contactPw = properties.get("mail.contact.pw");

function randumNum(len) {
	let str = "";
	for (let i = 0; i < len; i++) {
		str += Math.floor(Math.random() * 10);
	}
	return str;
}

function randomString() {
	const chars = "abcdefghjkmnpqrstuvwxyz123456789+@#$&!";
	const stringLength = 8;
	let randomstring = "";
	for (let i = 0; i < stringLength; i++) {
		const rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum, rnum + 1);
	}
	return randomstring;
}

var sendSms = async function (message, phoneNum, smsApiUrl, apiKey) {
	return new Promise(function (resolve, reject) {
		var obj = {};
		var data = {
			message: message,
			recipients: phoneNum,
		};

		var config = {
			method: "post",
			url: smsApiUrl + "/messages",
			headers: {
				"Content-Type": "application/json",
				"apiKey": apiKey,
			},
			data: data,
		};

		axios(config)
			.then(async function (response) {
				console.log(JSON.stringify(response.data));
				if (response.data.totalCount > 0) {
					obj.result = 1;
				} else {
					obj.result = -1;
				}
				resolve(obj);
			})
			.catch(function (error) {
				console.log(error);
				obj.result = -1;
				obj.txid = "";
				resolve(obj);
			});
	});
};

function sendEmail(toEmail, subject, message) {
	return new Promise(async function (resolve, reject) {
		var obj = {};
		try {
			let transporter = nodemailer.createTransport({
				// 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
				service: "gmail",
				// host를 gmail로 설정
				host: "smtp.gmail.com",
				port: 587,
				secure: false,
				auth: {
					// Gmail 주소 입력, 'testmail@gmail.com'
					user: mailUser,
					// Gmail 패스워드 입력
					pass: mailPw,
				},
			});

			var mailOptions = {
				from: mailUser, // 보내는 메일의 주소
				to: toEmail, // 수신할 이메일
				subject: subject, // 메일 제목
				text: message, // 메일 내용
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
					obj.result = -1;
				} else {
					obj.result = 1;
					console.log("Email sent: " + info.response);
				}
				resolve(obj);
			});
		} catch (e) {
			console.log(" sendEmail catch !! " + e.message);
			reject();
		}
	});
}

function sendContactEmail(subject, message) {
	return new Promise(async function (resolve, reject) {
		var obj = {};
		try {
			let transporter = nodemailer.createTransport({
				// 사용하고자 하는 서비스, gmail계정으로 전송할 예정이기에 'gmail'
				service: "gmail",
				// host를 gmail로 설정
				host: "smtp.gmail.com",
				port: 587,
				secure: false,
				auth: {
					// Gmail 주소 입력, 'testmail@gmail.com'
					user: contactUser,
					// Gmail 패스워드 입력
					pass: contactPw,
				},
			});

			var mailOptions = {
				from: contactUser, // 보내는 메일의 주소
				to: mailUser, // 수신할 이메일
				subject: subject, // 메일 제목
				text: message, // 메일 내용
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
					obj.result = -1;
				} else {
					obj.result = 1;
					console.log("Email sent: " + info.response);
				}
				resolve(obj);
			});
		} catch (e) {
			console.log(" sendContactEmail catch !! " + e.message);
			reject();
		}
	});
}

module.exports.randumNum = randumNum;
module.exports.sendSms = sendSms;
module.exports.randomString = randomString;
module.exports.sendEmail = sendEmail;
module.exports.sendContactEmail = sendContactEmail;