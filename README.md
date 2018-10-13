# DDIB BACKEND

## author : KJ

## 설치

### 요구사항
* nodejs 8.x <br />
* npm <br />
* mysql <br />

### 다운로드 & 설치
```
git clone https://github.com/KyungjeCho/test_ddib_backend.git
```
```
cd test_ddib_backend
```
mysql에 ddib 데이터베이스가 존재해야 하므로 실행한다. user_id에는 본인 데이터베이스 아이디를 적는다.
다른 데이터베이스를 이용할 경우 하지 않아도 된다. 
```
mysql -uuser_id -p

create databases ddib;

use ddib;

exit;

mysql -uuser_id -p ddib < ddib_test_db.sql
```
npm install로 코드에서 요구하는 미들웨어를 설치한다.
```
npm install
```
데이터베이스 템플릿을 이용하여 데이터베이스 코드를 작성한다.
```
cp ./lib/db.template.js ./lib/db.js
```
gedit이나 vi(m) 이나 다른 ide로 ./lib/db.js 파일을 수정한다.

USE gedit or vi(m) or other text editor to write ./lib/db.js
```
var mysql = require('mysql');

var db = mysql.createConnection({ 
  host:'[localhost]', <- 데이터베이스 서버 입력
  user:'[username]', <- 데이터베이스 유저 입력
  password:'[password]', <- 데이터베이스 비밀번호 입력
  database:'[dbname]' <- ddib 입력
});

db.connect();

module.exports = db;
```
```
cp ./lib/session.template.js ./lib/session.js
```
gedit이나 vi(m) 이나 다른 ide로 ./lib/session.js 파일을 수정한다.

USE gedit or vi(m) or other text editor to write ./lib/session.js
```
var session = require('express-session')
var FileStore = require('session-file-store')(session)

module.exports = session({
    secret: '', <- 원하는 세션 값을 넣는다
    resave: false,
    saveUninitialized: true,
    store: new FileStore(), //HACK: We should use mysql db.
    cookie: { maxAge: 600000}
});
```

서버 시작하기 위해 돌린다. window cmd로는 DEBUG=를 할 수 없다.
```
DEBUG=ddib:* npm start
```
혹은, 만약 코드를 새로 고칠때마다 서버에 적용하고 싶으면 nodemon 패키지를 다운로드 받고 실행한다.
```
npm install -g nodemon 
nodemon bin/www
```

입력한 서버로 들어간다.
enter [localhost]:3000/api

카테고리 api를 테스트한다.
 localhost:3000/api/category

## API

### **/category** 
- *Method : GET* 
- URL : [server-name]/api/category 
- Return : json file including all category
- Example : { results: [{ID: ,name: }, ...]}  

### **/login/customer**
- *Method : POST*
- Parameter : cid=[customer_id]&passwd=[password]
- URL : [server-name]/auth/login/customer
- Return : false(already logined) or "Welcome!"(Success) or "Who?"(Access denied)
- Example : Welcome!

### **/logout/customer**
- *Method : GET*
- URL : [server-name]/auth/logout/customer
- Return : "Logout!"
- Example : Logout!

## Slack

ddib-backend.slack.com

