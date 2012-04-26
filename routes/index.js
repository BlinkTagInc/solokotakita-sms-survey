var models = require('../models/models')
  , async = require('async')
  , _ = require('underscore')
  , moment = require('moment');

module.exports = function routes(app){

  var Sms = app.set('db').model('sms');

  /* Routes */

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

  app.get('/api/logs', function(req, res){
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

