var smsUtils = require('../lib/sms')
  , questions = require('../lib/questions');


module.exports = {

  doSurvey: function(app, req) {
    var Survey = app.set('db').model('survey')
      , response = req.param('msg').trim().toLowerCase()
      , nextQuestion;

    Survey.findOne({src: req.param('src')}, function(e, survey){
      if(!survey) {
        //create new survey object
        survey = new Survey({src: req.param('src')});
        nextQuestion = questions.preSurveyText;
      } else if(!survey.neighborhood){
        //save neighborhood
        if(questions.neighborhoods[response]){
          survey.neighborhood = questions.neighborhoods[response];
          nextQuestion = questions.questions[survey.neighborhood][survey.answers.length];
        } else {
          //not a valid neighborhood
          nextQuestion = questions.preSurveyText;
        }
      } else if(survey.answers.length < questions.questions[survey.neighborhood].length) {
        //save answer
        survey.answers.push({
            number: (survey.answers.length + 1)
          , answer: response
        });
        if(survey.answers.length < questions.questions[survey.neighborhood].length) {
          //Send next question
          nextQuestion = questions.questions[survey.neighborhood][survey.answers.length];
        } else {
          //send thank you text
          nextQuestion = questions.thankYouText;
        }
      } else {
        //send thank you text
        nextQuestion = questions.thankYouText;
      }

      survey.save(function(e){
        //send next question, if any remain (don't send if test is true)
        if(req.param('test') != 'true'){
          smsUtils.sendMessage(nextQuestion, survey.src);
        }
      });
    });
  },

  doTestSurvey: function(app, req, res) {
    var Survey = app.set('db').model('survey');

    Survey.findOne({src: req.param('src')}, function(e, survey){
      //send next question, if any remain
      if(survey){
        if(survey.answers.length < questions.questions.length) {
          var question = questions.questions[survey.answers.length];
        } else {
          //send thank you notification
          var question = questions.thankYouText;
        }
        res.json({
            question: question
          , count: questions.questions.length
          , number: survey.answers.length + 1
        });
      } else {
        res.json({error: 'No matching survey found'});
      }
    });
  }

};

