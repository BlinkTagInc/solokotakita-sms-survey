var models = require('../models/models')
  , async = require('async')
  , _ = require('underscore')
  , moment = require('moment')
  , bcrypt = require('bcrypt')
  , salt = bcrypt.genSaltSync(10)
  , smsUtils = require('../lib/sms')
  , survey = require('../lib/survey');

function isAuthenticated(req, res, next){
  if(req.session.isAuthenticated){
    next();
  }else{
    res.redirect('/login');
  }
}

module.exports = function routes(app){

  var Sms = app.set('db').model('sms')
    , User = app.set('db').model('user')
    , Survey = app.set('db').model('survey');


  /* Routes */

  app.get('/', isAuthenticated, function(req, res){
    res.render('index')
  });

  app.get('/messageLog', isAuthenticated, getMessageLog);
  app.get('/messageLog/:page', isAuthenticated, getMessageLog);

  function getMessageLog(req, res){
    var resultsPerPage = 100
      , page = (parseInt(req.params.page, 10)) ? req.params.page : 1;
    Sms
      .find()
      .limit(resultsPerPage)
      .skip((page - 1) * resultsPerPage)
      .run(function(e, results){
        Sms.count(function(e, count){
          res.render('messageLog', {results: results, page: page, pages: Math.ceil(count / resultsPerPage), resultsPerPage: resultsPerPage});
        });
      });
  };

  app.get('/results', isAuthenticated, function(req, res){
    Survey.find(function(e, results){
      console.log(results);
      res.render('results', {results: results});
    });
  });

  app.get('/tester', isAuthenticated, function(req, res){
    res.render('tester');
  });



  app.get('/login', function(req, res){
    res.render('login', { title: 'Solo Kota Kita | Login' });
  });

  app.post('/sessions/create', function(req, res){
    User.findOne({username: req.body.username}, function(e, result){
      if(result && bcrypt.compareSync(req.body.password, result.password)){
        req.session.user = {
          username: result.username
        }
        req.session.isAuthenticated = true;
        res.redirect('/');
      } else {
        res.render('login', { title: 'Solo Kota Kita | Login', error: 'Login Error' });
      }
    });
  });

  app.get('/logout', function(req, res){
    req.session.destroy(function(e){
      res.redirect('/login');
    });
  });

  app.get('/signup', isAuthenticated, function(req, res){
    res.render('signup', { title: 'Solo Kota Kita | Create New User' });
  });

  app.post('/users/create', isAuthenticated, function(req, res){
    if(req.body.username && req.body.password){
      if(req.body.password == req.body.passwordAgain){
        var user = new User({
            username: req.body.username
          , password: bcrypt.hashSync( req.body.password, salt )
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

  app.get('/downloads/results.csv', isAuthenticated, function(req, res){
    var csv = '';
    Survey.find(function(e, results){
      res.writeHead(200, {'Content-Type':'text/csv'});
      results.forEach(function(result){
        var line = [];
        line.push(result.src)
        result.answers.forEach(function(answer){
          line.push(answer.answer);
        });
        csv += line.join(',') + "\n";
      });
      res.write(csv);
      res.end();
    });
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
      smsUtils.saveMessage(Sms, req.param('date'), req.param('src'), req.param('dst'), req.param('enc'), req.param('msg'));

      survey.doSurvey(app, req);
      
      var success = '<?xml version="1.0" encoding="UTF-8" ?>\n' +
        '<inboundAcknowledgment>\n' +
        '<username>solokota</username>\n' +
        '<password>S0l0K0t4</password>\n' +
        '<returnCode>1</returnCode>\n' +
        '</inboundAcknowledgment>';
      res.send( success, {'Content-Type':'text/xml'}, 200);
    }
  });

  app.get('/api/nextQuestion', isAuthenticated, function(req, res){
    survey.doTestSurvey(app, req, res);
  });

  app.get('/api/results', isAuthenticated, function(req, res){
    Survey.find(function(e, results){
      res.json(results);
    });
  });

  //Nothing specified
  app.all('*', function notFound(req, res) {
    res.send('Not Found');
  });

}

