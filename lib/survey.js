var smsUtils = require('../lib/sms')
  , questions = require('../lib/questions')
  , moment = require('moment')
  , _ = require('underscore');


module.exports = {

  doSurvey: function(app, req, res) {
    var Survey = app.set('db').model('survey')
      , Sms = app.set('db').model('sms')
      , response = req.param('msg').trim().toLowerCase()
      , nextQuestion
      , surveyStatus
      , controlWords = ['test', 'start', 'mulai'];

    Survey.findOne({src: req.param('src')}, function(e, survey){
      if(!survey) {
        //create new survey object
        survey = new Survey({src: req.param('src')});
      } else if(survey.answers.length < questions.questions.length && !_.include(controlWords, response)) {
        //don't save answer if 'test' or 'start' 
        survey.answers.push({
            number: (survey.answers.length + 1)
          , answer: response
        });
      }

      if(survey.answers.length < questions.questions.length) {
        //Send next question
        nextQuestion = (survey.answers.length + 1) + ': ' + questions.questions[survey.answers.length];
        surveyStatus = survey.answers.length + 1;
      } else {
        //send thank you text
        nextQuestion = questions.thankYouText;
        surveyStatus = 'end';
      }

      survey.save(function(e){
        //send next question, if any remain (don't send if test is true)

        if(req.param('test') != 'true') {
          sendSuccess(res);
          smsUtils.sendMessage(nextQuestion, survey.src, function(e, response){
            var sms = new Sms({
                date: ''
              , src: 'SKK'
              , dst: survey.src
              , msg: nextQuestion
              , direction: 'outbound'
              , responseCode: (e) ? e.message : response
              , error: (e) ? true : false
              , timestamp: moment().format()
            });
            sms.save();
            console.log((e) ? e.message : response);
          });
        } else {
          //testing survey, send next question as JSON
          res.json({
              question: nextQuestion
            , status: surveyStatus
          });
        }
      });
    });
  },

  resetSurvey: function(app, req, res) {
    var Survey = app.set('db').model('survey')
      , Sms = app.set('db').model('sms')
      , resetMessage = 'The survey has been reset. Text "Mulai" to restart the survey.';
    Survey.remove({ src: req.param('src') }, function(e) {
      //Send notice that survey has been reset
      sendSuccess(res);
      smsUtils.sendMessage(resetMessage, req.param('src'), function(e, response){
        var sms = new Sms({
            date: ''
          , src: 'SKK'
          , dst: req.param('src')
          , msg: resetMessage
          , direction: 'outbound'
          , responseCode: (e) ? e.message : response
          , error: (e) ? true : false
          , timestamp: moment().format()
        });
        sms.save();
        console.log((e) ? e.message : response);
      });
    });
  },

  doPing: function(app, req, res) {
    sendSuccess(res);
    var pingText = "Message recieved " + moment().format()
      , Sms = app.set('db').model('sms');
    smsUtils.sendMessage(pingText, req.param('src'), function(e, response){
      var sms = new Sms({
          date: ''
        , src: 'SKK'
        , dst: req.param('src')
        , msg: pingText
        , direction: 'outbound'
        , responseCode: (e) ? e.message : response
        , error: (e) ? true : false
        , timestamp: moment().format()
      });
      sms.save();
      console.log((e) ? e.message : response);
    });
  }
};

function sendSuccess(res){
  var success = '<?xml version="1.0" encoding="UTF-8" ?>\n' +
    '<inboundAcknowledgment>\n' +
    '<username>solokota</username>\n' +
    '<password>S0l0K0t4</password>\n' +
    '<returnCode>1</returnCode>\n' +
    '</inboundAcknowledgment>';
  res.send( success, {'Content-Type':'text/xml'}, 200 );
}
