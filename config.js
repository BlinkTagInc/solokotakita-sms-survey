var express = require('express')
  , connect = require('connect')
  , mongoose = require('mongoose')
  , mongoURI = process.env['MONGO_URI'] || 'mongodb://localhost/sms'
  , db = mongoose.connect(mongoURI)
  , jadevu = require('jadevu')
  , RedisStore = require('connect-redis')(express);


module.exports = function(app){
  app.configure(function(){
    this
      .use(express.bodyParser())
      .set('views', __dirname + '/views')
      .set('view engine', 'jade')
      .set('public', __dirname + '/public')
      .enable('jsonp callback')
      .enable('error templates')
      .use(express.static(__dirname + '/public'))
      .set('db', db);
  });

  // Dev
  app.configure('development', function(){
    this
      .use(express.profiler())
      .use(express.cookieParser())
      .use(express.session({ secret: "pwn noobs"}))
      .use(express.logger('\x1b[90m:remote-addr -\x1b[0m \x1b[33m:method\x1b[0m' +
         '\x1b[32m:url\x1b[0m :status \x1b[90m:response-time ms\x1b[0m'))
      .use(express.errorHandler({dumpExceptions: true, showStack: true}))
      .enable('dev')
      .set('domain', 'app.local');
  });
  
  // Prod
  app.configure('production', function(){
    this
      .use(express.logger({buffer: 10000}))
      .use(connect.cookieParser('tiutiuti454545utiutiut'))
      .use(connect.session({ store: new RedisStore, secret: 'keybsdfsdfoardy cat' }))
      .use(express.errorHandler({dumpExceptions: true, showStack: true}))
      .enable('prod')
      .set('domain', 'sms.solokotakita.org');
  });
}
