var express = require('express');
var path = require('path');
var url = require('url');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var nconf = require('nconf');
var db = require('mongoose').connect(process.env.MONGOLAB_URI || 'mongodb://localhost/sms');

nconf
  .argv()
  .env()
  .file({file:'./config.json'});

var app = express();

if(app.get('env') === 'development') {
	app.use(require('connect-livereload')());
}

app.set('db', db);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser(nconf.get('SESSION_SECRET')));
app.use(express.static(path.join(__dirname, 'public')));


if(app.get('env') !== 'development') {
  var RedisStore = require('connect-redis')(session),
      redisURL = url.parse(nconf.get('REDISCLOUD_URL')),
      store = new RedisStore({
        host: redisURL.hostname,
        port: redisURL.port,
        pass: redisURL.auth.split(':')[1],
        ttl: 1209600 // Two weeks
      }),
      cookie = {
        maxAge: 31536000000
      };
} else {
  var memoryStore = session.MemoryStore,
      store = new memoryStore(),
      cookie = {
        maxAge: 3600000,
      };
}


app.use(session({
  store: store,
  secret: nconf.get('SESSION_SECRET'),
  saveUninitialized: true,
  resave: true,
  cookie: cookie
}));


if(app.get('env') !== 'development') {
  app.all('*', routes.force_https);
}

require('./routes')(app);

// error handlers
require('./lib/errors')(app);

module.exports = app;
