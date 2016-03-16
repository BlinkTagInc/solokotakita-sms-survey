var models = require('../models/models')
  , async = require('async')
  , _ = require('underscore')
  , moment = require('moment')
  , bcrypt = require('bcrypt')
  , nconf = require('nconf')
  , salt = bcrypt.genSaltSync(10)
  , smsUtils = require('../lib/sms')
  , survey = require('../lib/survey')
  , questions = require('../lib/questions')
  , kelurahans = require('../lib/kelurahans');

function isAuthenticated(req, res, next) {
  if(req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = function routes(app){

  var Sms = app.set('db').model('sms');
  var User = app.set('db').model('user');
  var Survey = app.set('db').model('survey');

  /* Routes */

  app.get('/', isAuthenticated, function(req, res) {
    res.render('index');
  });


  app.get('/messageLog', isAuthenticated, getMessageLog);
  app.get('/messageLog/:page', isAuthenticated, getMessageLog);

  function getMessageLog(req, res, next) {
    var resultsPerPage = 100;
    var page = (parseInt(req.params.page, 10)) ? req.params.page : 1;
    Sms
      .find()
      .sort({$natural: -1})
      .limit(resultsPerPage)
      .skip((page - 1) * resultsPerPage)
      .exec(function(e, results){
        if(e) return next(e);
        Sms.count(function(e, count){
          if(e) return next(e);
          res.render('messageLog', {results: results, page: page, pages: Math.ceil(count / resultsPerPage), resultsPerPage: resultsPerPage});
        });
      });
  }

  app.get('/results/:kelurahan', isAuthenticated, function(req, res, next) {
    Survey
      .find()
      .sort({$natural: -1})
      .exec(function(e, results){
        if(e) return next(e);
        res.render('results', {results: results, questions: questions.questions, kelurahan: req.params.kelurahan});
      });
  });

  app.get('/results/edit/:id', isAuthenticated, function(req, res, next) {
    Survey
      .findOne({_id: req.params.id})
      .exec(function(e, result){
        if(e) return next(e);
        res.render('editResult', {result: result, questions: questions.questions, referer: req.header('Referer')});
      });
  });

  app.post('/api/results/update/:id', isAuthenticated, function(req, res, next) {
    var answers = [];
    _.each(req.body, function(answer, i){
      if(!isNaN(parseFloat(i))){
        answers.push({number: i, answer: answer});
      }
    });
    Survey.update({_id: req.params.id}, {$set: { answers: answers }}, {upsert: true}, function(e){
      if(e) return next(e);
      res.redirect(req.body.referer);
    });
  });


  app.get('/api/kelurahans', isAuthenticated, function(req, res, next) {
    res.json(kelurahans);
  });


  app.get('/tester', isAuthenticated, function(req, res, next) {
    res.render('tester');
  });


  app.post('/api/sms-test', isAuthenticated, function(req, res, next) {
    if(req.body.dst) {
      smsUtils.sendMessage('This is a Test', nconf.get('SMS_SENDER_ID'), req.body.dst, function(e, response){
        if(e) return next(e);

        console.log(response);

        res.json(response);
      });
    }
  });


  app.get('/login', function(req, res, next) {
    res.render('login', { title: 'Solo Kota Kita | Login' });
  });

  app.post('/sessions/create', function(req, res, next) {
    User.findOne({username: req.body.username}, function(e, result) {
      if(e) return next(e);
      if(result && bcrypt.compareSync(req.body.password, result.password)) {
        req.session.user = {
          username: result.username
        };
        req.session.isAuthenticated = true;
        res.redirect('/');
      } else {
        res.render('login', { title: 'Solo Kota Kita | Login', error: 'Login Error' });
      }
    });
  });

  app.get('/logout', function(req, res, next) {
    req.session.destroy(function(e){
      if(e) return next(e);
      res.redirect('/login');
    });
  });

  app.get('/signup', function(req, res, next) {
    res.render('signup', { title: 'Solo Kota Kita | Create New User' });
  });

  app.post('/users/create', function(req, res, next) {
    if(nconf.get('ALLOW_SIGNUP') === 'true' || req.session.isAuthenticated) {
      if(req.body.username && req.body.password){
        if(req.body.password == req.body.passwordAgain){
          var user = new User({
            username: req.body.username,
            password: bcrypt.hashSync( req.body.password, salt )
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
    } else {
      res.render('signup', { title: 'Solo Kota Kita | Create New User', error: 'Signup not allowed' });
    }
  });

  app.get('/downloads/:kelurahan' + '.csv', isAuthenticated, function(req, res, next) {
    var kelurahan = req.params.kelurahan.toLowerCase();
    Survey
      .find()
      .sort({$natural: -1})
      .exec(function(e, results){
        if(e) return next(e);
        res.writeHead(200, {'Content-Type':'text/csv'});
        var csv = 'Number';
        results[0].answers.forEach(function(answer, i){
          csv += ",Q" + (i+1);
        });
        csv += "\n";
        results.forEach(function(result){
          if(kelurahan == "all" || (result.answers[0] && result.answers[0].answer.toLowerCase() == kelurahan )) {
            var line = result.answers.map(function(answer){
              return answer.answer;
            });
            line.unshift( result.src );
            csv += line.join(',') + "\n";
          }
        });
        res.write(csv);
        res.end();
      });
  });


  app.get('/api/questions', isAuthenticated, function(req, res, next) {
    res.json(questions);
  });


  app.get('/api/incoming', function(req, res, next) {
    var message = req.query.msg ? req.query.msg.toLowerCase() : '';

    console.log('Incoming SMS', message);

    /*
     * Format specified
     * http://<Client domain name and script>?date=<DATETIME>&src=<SENDER_NUMBER>&dst=<DESTINATION_NUMBER>&enc=<ENCODING>&msg=<TEXT_MESSAGE>
     */

    if(!req.query.msg || !req.query.src){
      var fail = '<?xml version="1.0" encoding="UTF-8" ?>\n' +
        '<deliveryAcknowledgment>\n' +
        '<error>No source or message provided</error>\n' +
        '</deliveryAcknowledgment>';
      res.send(fail, {'Content-Type':'text/xml'}, 200);
    } else {
      //Save SMS
      var sms = new Sms({
        date: req.query.date,
        src: req.query.src,
        dst: req.query.dst,
        msg: req.query.msg,
        direction: 'inbound',
        timestamp: moment().format()
      });
      sms.save();

      //Do ping if ping sent
      if (message == 'ping') {
        survey.doPing(app, req, res);
      } else if (message == 'reset') {
        survey.resetQuestion(app, req, res);
      } else if (message == 'reset all') {
        survey.resetSurvey(app, req, res);
      } else {
        survey.doSurvey(app, req, res);
      }
    }
  });


  app.get('/api/results', isAuthenticated, function(req, res, next) {
    Survey.find(function(e, results){
      res.json(results);
    });
  });
};
