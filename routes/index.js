var models = require('../models/models')
  , async = require('async')
  , _ = require('underscore');

module.exports = function routes(app){

  var Sms = app.set('db').model('Sms');

  /* Routes */

  app.get('/api/incoming', function(req, res){
    if(!req.param('text')){
      res.json({status: 'error', error: 'No text provided'});
    } else if(!req.param('senderPhone')){
      res.json({status: 'error', error: 'No senderPhone provided'});
    } else {
      //Save SMS
      var sms = new Sms({
          timestamp: req.param('timestamp') || Math.round(Date.now()/1000)
        , text: req.param('text')
        , senderPhone: req.param('senderPhone')
      });
      sms.save(function(e){
        res.json(e ||{status: 'success'});
      });
    }
  });

  //Nothing specified
  app.all('*', function notFound(req, res) {
    res.send('node');
  });

}

