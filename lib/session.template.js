var session = require('express-session')
var FileStore = require('session-file-store')(session)

module.exports = session({
    secret: '',
    resave: false,
    saveUninitialized: true,
    store: new FileStore() //HACK: We should use mysql db.
});