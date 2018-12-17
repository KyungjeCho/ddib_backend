// 비밀번호 암호화 키 템플릿
// Author : KJ
// Created Date : 2018.11.07

var CryptoPasswd = {
    secret : '',
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