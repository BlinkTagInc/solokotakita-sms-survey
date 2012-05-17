var models = require('../models/models')
  , async = require('async')
  , _ = require('underscore')
  , moment = require('moment')
  , bcrypt = require('bcrypt');

function isAuthenticated(req, res, next){
  if(req.isAuthenticated){
    next();
  }else{
    res.redirect('/login');
  }
}

module.exports = function routes(app){

  var Sms = app.set('db').model('sms');
  var User = app.set('db').model('user');

  /* Routes */

  app.get('/', isAuthenticated, function(req, res){
    res.render('index')
  });

  app.get('/login', function(req, res){
    res.render('login', { title: 'Solo Kota Kita | Login' });
  });

  app.post('/sessions/create', function(req, res){
    console.log(req.body.username);
    console.log(req.body.password);
  });

  app.get('/signup', function(req, res){
    res.render('signup', { title: 'Solo Kota Kita | Create New User' });
  });

  app.post('/users/create', function(req, res){
    if(req.body.username && req.body.password){
      if(req.body.password == req.body.passwordAgain){
        var user = new User({
            username: req.body.username
          , password: req.body.password
        });
        user.save(function(e){
          if(e){
            res.render('signup', { title: 'Solo Kota Kita | Create New User', error: e});
          } else {
            res.redirect('/login');
          }
        });
      } else {
        res.render('signup', { title: 'Solo Kota Kita | Create New User', error: 'Mismatched Passwords' });
      }
    } else {
      res.render('signup', { title: 'Solo Kota Kita | Create New User', error: 'Missing Username or Password' });
    }
  });

  app.get('/api/incoming', function(req, res){

  /**
   * Format specified 
   * http://<Client domain name and script>?date=<DATETIME>&src=<SENDER_NUMBER>&dst=<DESTINATION_NUMBER>&enc=<ENCODING>&msg=<TEXT_MESSAGE>
   */

    if(!req.param('msg') || !req.param('src')){
      var fail = '<?xml version="1.0" encoding="UTF-8" ?>\n' +
        '<inboundAcknowledgment>\n' +
        '<error>No source or message provided</error>\n' +
        '</inboundAcknowledgment>';
      res.send( fail, {'Content-Type':'text/xml'}, 200);
    } else {
      //Save SMS
      var sms = new Sms({
          date: req.param('date') || moment().format('YYYY-MM-DD HH:mm:ss')
        , src: req.param('src')
        , dst: req.param('dst')
        , enc: req.param('enc')
        , msg: req.param('msg')
      });
      sms.save(function(e){
        var success = '<?xml version="1.0" encoding="UTF-8" ?>\n' +
          '<inboundAcknowledgment>\n' +
          '<username>solokota</username>\n' +
          '<password>S0l0K0t4</password>\n' +
          '<returnCode>1</returnCode>\n' +
          '</inboundAcknowledgment>';
        res.send( success, {'Content-Type':'text/xml'}, 200);
      });
    }
  });

  app.get('/api/logs', isAuthenticated, function(req, res){
    Sms.find({}, function(e, results){
      console.log(results);
      res.json(results);
    });
  });

  //Nothing specified
  app.all('*', function notFound(req, res) {
    res.send('node');
  });

}

