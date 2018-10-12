# DDIB BACKEND

## author : KJ

## install

nodejs 8.x
npm
mysql

git clone https://github.com/KyungjeCho/test_ddib_backend.git

cd test_ddib_backend

mysql -uuser_id -p

create databases ddib;

use ddib;

exit;

mysql -uuser_id -p ddib < ddib_test_db.sql

npm install

cp ./lib/db.template.js ./lib/db.js

USE gedit or vi(m) or other text editor to write ./lib/db.js

var mysql = require('mysql');

var db = mysql.createConnection({ <br />
  host:'[localhost]', <- input your db host <br /> 
  user:'[username]', <- input your db user name<br />
  password:'[password]', <- input your db password <br />
  database:'[dbname]' <- and we use ddib db. <br />
});

db.connect();

module.exports = db;

DEBUG=ddib:* npm start

enter localhost:3000/api

test localhost:3000/api/category

## Slack

ddib-backend.slack.com
