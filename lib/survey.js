var smsUtils = require('../lib/sms')
  , questions = require('../lib/questions');


module.exports = {

  doSurvey: function(app, req, res) {
    var Survey = app.set('db').model('survey')
      , Sms = app.set('db').model('sms')
      , response = req.param('msg').trim().toLowerCase()
      , nextQuestion
      , surveyStatus;

    Survey.findOne({src: req.param('src')}, function(e, survey){
      if(!survey) {
        //create new survey object
        survey = new Survey({src: req.param('src')});
        nextQuestion = questions.questions[0];
        surveyStatus = 1;
      } else if(response == 'test' || response == 'start') {
        //Survey already started, don't record answer but send next question
        nextQuestion = questions.questions[survey.answers.length];
        surveyStatus = survey.answers.length + 1;
      } else if(survey.answers.length < questions.questions.length) {
        //save answer
        survey.answers.push({
            number: (survey.answers.length + 1)
          , answer: response
        });
        if(survey.answers.length < questions.questions.length) {
          //Send next question
          nextQuestion = questions.questions[survey.answers.length];
          surveyStatus = survey.answers.length + 1;
        } else {
          //send thank you text
          nextQuestion = questions.thankYouText;
          surveyStatus = 'end';
        }
      } else {
        //send thank you text
        nextQuestion = questions.thankYouText;
        surveyStatus = 'end';
      }

      survey.save(function(e){
        //send next question, if any remain (don't send if test is true)
        smsUtils.saveMessage(Sms, '', 'SKK', survey.src, nextQuestion, 'outbound');
        if(req.param('test') != 'true') {
          smsUtils.sendMessage(nextQuestion, survey.src);
          var success = '<?xml version="1.0" encoding="UTF-8" ?>\n' +
            '<inboundAcknowledgment>\n' +
            '<username>solokota</username>\n' +
            '<password>S0l0K0t4</password>\n' +
            '<returnCode>1</returnCode>\n' +
            '</inboundAcknowledgment>';
          res.send( success, {'Content-Type':'text/xml'}, 200);
        } else {
          res.json({
              question: nextQuestion
            , status: surveyStatus
          });
        }
      });
    });
  }

};

