var smsUtils = require('../lib/sms');

var questions = [
    'Kelurahan, RT dan RW anda tinggal?'
  , 'Berapa orang di RT anda yang bekerja di sektor Batik?'
  , 'Berapa jumlah industri batik di RT anda?'
  , 'Berapa jumlah industri skala rumah tangga di RT anda?'
  , 'Apa jenis industri lain selain batik? (1. kerajinan kriya, 2. Makanan olahan, 3. Lain-lain)'
  , 'Berapa jumlah penduduk yang tidak memiliki pekerjaan?'
]

module.exports = {

  doSurvey: function(app, req) {
    var Survey = app.set('db').model('survey');

    Survey.findOne({src: req.param('src')}, function(e, survey){
      if(survey){
        survey.answers.push({
            number: (survey.answers.length + 1)
          , answer: req.param('msg').trim()
        });
      } else {
        survey = new Survey({src: req.param('src')});
      }
      survey.save();

      //send next question, if any remain
      if(survey.answers.length < questions.length) {
        smsUtils.sendMessage(questions[survey.answers.length], survey.src);
      } else {
        //send thank you notification
        smsUtils.sendMessage("Thanks for taking our survey. Your answers have been recorded.", survey.src);
      }
    });
  }

};

