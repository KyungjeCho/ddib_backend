var mysql = require('mysql');
var db = mysql.createConnection({
  host:'', // 데이터베이스 호스트
  user:'', // 데이터베이스 유저
  password:'', // 데이터베이스 비밀번호
  database:'' // ddib
});
db.connect();
module.exports = db;