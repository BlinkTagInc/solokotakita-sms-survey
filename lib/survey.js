var smsUtils = require('../lib/sms');

var preSurveyText = "Which neighborhood are you from? (1. Sondakan, 2. Sudiroprajan)";

var neighborhoods = {
    1: 'sondakan'
  , 2: 'sudiroprajan'
};

var questions = {
  sondakan: [
      'Kelurahan, RT dan RW anda tinggal?'
    , 'Berapa orang di RT anda yang bekerja di sektor Batik?'
    , 'Berapa jumlah industri batik di RT anda?'
    , 'Berapa jumlah industri skala rumah tangga di RT anda?'
    , 'Apa jenis industri lain selain batik? (1. kerajinan kriya, 2. Makanan olahan, 3. Lain-lain)'
    , 'Berapa jumlah penduduk yang tidak memiliki pekerjaan?'
  ],
  sudiroprajan: [
      'Kelurahan, RT dan RW anda tinggal?'
    , 'Berapa jumlah lokasi / titik jalan yang rusak atau tergenang di RT anda?'
    , 'Berapa kali dalam setahun banjir di RT anda terjadi?'
    , 'Berapa rumah atau KK yang terdampak langsung oleh banjir?'
    , 'Berapa lama (hari) lama banjir berlangsung?'
    , 'Apa dampak dari banjir? (1. Kesehatan anak, 2. Kesehatan orang tua, 3. Kehilangan harta benda, 4. Jalan terputus, 5. Kesehatan lingkungan)'
    , 'Berapa jumlah rumah semi-permanen di RT anda?'
    , 'Berapa jumlah selokan yang mampet atau luber?'
    , 'Berapa jumlah lokasi (titik) pembuangan sampah tidak resmi?'
  ]
}

var thankYouText = "Thanks for taking our survey. Your answers have been recorded.";

module.exports = {

  doSurvey: function(app, req) {
    var Survey = app.set('db').model('survey')
      , response = req.param('msg').trim().toLowerCase()
      , nextQuestion;

    Survey.findOne({src: req.param('src')}, function(e, survey){
      if(!survey) {
        //create new survey object
        survey = new Survey({src: req.param('src')});
        nextQuestion = preSurveyText;
      } else if(!survey.neighborhood){
        //save neighborhood
        if(neighborhoods[response]){
          survey.neighborhood = neighborhoods[response];
          nextQuestion = questions[survey.neighborhood][survey.answers.length];
        } else {
          //not a valid neighborhood
          nextQuestion = preSurveyText;
        }
      } else if(survey.answers.length < questions[survey.neighborhood].length) {
        //save answer
        survey.answers.push({
            number: (survey.answers.length + 1)
          , answer: response
        });
        if(survey.answers.length < questions[survey.neighborhood].length) {
          //Send next question
          nextQuestion = questions[survey.neighborhood][survey.answers.length];
        } else {
          //send thank you text
          nextQuestion = thankYouText;
        }
      } else {
        //send thank you text
        nextQuestion = thankYouText;
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
        if(survey.answers.length < questions.length) {
          var question = questions[survey.answers.length];
        } else {
          //send thank you notification
          var question = thankYouText;
        }
        res.json({
            question: question
          , count: questions.length
          , number: survey.answers.length + 1
        });
      } else {
        res.json({error: 'No matching survey found'});
      }
    });
  }

};

