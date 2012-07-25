var http = require('http')
  , moment = require('moment');

module.exports = {

  /**
   * Sends a message
   * @param {String} msg The message to be sent
   * @param {Int} dst The destination phone number
   * http://202.155.119.168:8080/smsapi/pages/sendSmsLatin.do?g3p4i=solokota&G4PIpw=S0l0K0t4&src=SKK&dst=62811820738&msg=TestFirstWAP
   */
  sendMessage: function(msg, dst) {
    var basePath = '/smsapi/pages/sendSmsLatin.do?g3p4i=solokota&G4PIpw=S0l0K0t4&src=6285772887958';
    if(msg && dst){

      console.log('To: ' + dst + ' ' + msg);

      var options = {
          host: '202.155.119.168'
        , port: 8080
        , path: basePath + '&dst=' + encodeURIComponent(dst) + '&msg=' + encodeURIComponent(msg)
        , method: 'GET'
      }

      var req = http.request(options, function(res){
        console.log('STATUS: ' + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
          console.log('BODY: ' + chunk);
        });
      });
      req.on('error', function(e) {
        console.log(e.message);
      });
      req.end();
    }
  },

  /**
   * Saves a message
   */
  saveMessage: function(Sms, date, src, dst, msg, direction) {
    var sms = new Sms({
        date: date
      , src: src
      , dst: dst
      , msg: msg
      , direction: direction
      , timestamp: moment().format()
    });
    sms.save();
  }

};

