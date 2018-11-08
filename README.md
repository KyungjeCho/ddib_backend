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
비밀번호 암호화 키를 작성하기 위해 passwordSecrete.js를 만들어 사용자가 암호화 키를 입력한다.
```
cp ./lib/db.template.js ./lib/db.js
cp ./lib/passwordSecret.template.js ./lib/passwordSecret.js 
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
var CryptoPasswd = {
    secret : '', // <- 암호화 키 입력
    create : function(password){
      const encrypted = crypto.createHmac('sha1', this.secret)
                              .update(password)
                              .digest('base64')
      return encrypted;
    },
    verify : function(encrypted_password, password) {
      const encrypted = crypto.createHmac('sha1', this.secret)
                              .update(password)
                              .digest('base64')
      return encrypted === encrypted_password;
    }
  }

module.exports = CryptoPasswd;
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

### **/wishlist** 
- *Method : POST* 
- Params : iid
- URL : [server-name]/api/wishlist 
- Return : true or false
- Example : { success : true } or { success : false } or Unauthorized

### **/faq** 
- *Method : POST* 
- Params : token, question, answer
- URL : [server-name]/api/faq 
- Return : success check
- Example : { success : true } or Unantherized or { success : false }


### **/sign_up/customer** 
- *Method : POST* 
- Params : cid, passwd, name, address, latitude, longitude
- URL : [server-name]/api/sign_up/customer 
- Return : json file 
- Example : { success : true } or { success : false } or {success : false, idError : true, passwdError : false }

### **/login/customer**
- *Method : POST*
- Parameter : cid=[customer_id]&passwd=[password]
- URL : [server-name]/auth/login/customer
- Return : {success : true, token : '[random_string]'} or {success : false, error : true }
- Example : {success : true, token : '[random_string]'} or {success : false, error : true }

### **/logout/customer**
- *Method : GET*
- URL : [server-name]/auth/logout/customer
- Return : "Logout!"
- Example : Logout!

### **/alarm** 
- *Method : POST* 
- Params : cid
- URL : [server-name]/api/alarm
- Return : json file including an item that the customer bought the most
- Example : { success : true, id : 1, sid : '010-9999-1111', name : '순대국' } or { success : false } 

## Slack

ddib-backend.slack.com

