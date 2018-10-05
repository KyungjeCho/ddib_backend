# DDIB BACKEND

## author : KJ

## install

nodejs 8.x
npm
mysql

git clone https://github.com/KyungjeCho/test_ddib_backend.git

cd test_ddib_backend

mysql -uuser_id -p ddib < ddib_test_db.sql

npm install

mv ./lib/db.template.js ./lib/db.js

USE gedit or vi(m) or other text editor to write ./lib/db.js

var mysql = require('mysql');
var db = mysql.createConnection({
  host:'[localhost]', <-
  user:'[username]', <-
  password:'[password]', <-
  database:'[dbname]' <-
});
db.connect();
module.exports = db;

DEBUG=ddib:* npm start

enter localhost:3000/api

test localhost:3000/api/category
