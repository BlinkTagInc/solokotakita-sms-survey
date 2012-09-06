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
        surveyStatus = (survey.answers.length + 1);
      } else {
        //send thank you text
        nextQuestion = questions.thankYouText;
        surveyStatus = 'end';
      }

      survey.save(function(e){
        sendMessage(app, req, res, nextQuestion, survey.src, surveyStatus);
      });
    });
  },

  resetQuestion: function(app, req, res) {
    var Survey = app.set('db').model('survey')
      , Sms = app.set('db').model('sms')
      , resetMessage;
    Survey.findOne({ src: req.param('src') }, function(e, survey) {
      if (survey) {
        //remove last question if a survey exists
        survey.answers.pop();
        survey.save();
        resetMessage = (survey.answers.length + 1) + ': ' + questions.questions[survey.answers.length];
      } else {
        resetMessage = "Ketik 'Mulai' untuk memulai survei.";
      }
      //Send notice that survey has been reset
      sendMessage(app, req, res, resetMessage, req.param('src'), (survey.answers.length + 1));
    });
  },

  resetSurvey: function(app, req, res) {
    var Survey = app.set('db').model('survey')
      , Sms = app.set('db').model('sms')
      , resetMessage = "Survey telah diulangi. Ketik 'Mulai' untuk mengulang survei";
    Survey.remove({ src: req.param('src') }, function(e) {
      sendMessage(app, req, res, resetMessage, req.param('src'), 1);
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

function sendMessage(app, req, res, msg, dst, status) {
  var Sms = app.set('db').model('sms');
  //send next question, if any remain (don't send if test is true)
  if(req.param('test') != 'true') {
    sendSuccess(res);
    smsUtils.sendMessage(msg, dst, function(e, response){
      var sms = new Sms({
          date: ''
        , src: 'SKK'
        , dst: dst
        , msg: msg
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
        question: msg
      , status: status
    });
  }

}

function sendSuccess(res){
  var success = '<?xml version="1.0" encoding="UTF-8" ?>\n' +
    '<inboundAcknowledgment>\n' +
    '<username>solokota</username>\n' +
    '<password>S0l0K0t4</password>\n' +
    '<returnCode>1</returnCode>\n' +
    '</inboundAcknowledgment>';
  res.send( success, {'Content-Type':'text/xml'}, 200 );
}
