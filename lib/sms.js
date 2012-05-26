var http = require('http');

module.exports = {

  /**
   * Sends a message
   * @param {String} msg The message to be sent
   * @param {Int} dst The destination phone number
   * http://202.155.119.168:8080/smsapi/pages/sendSmsLatin.do?g3p4i=solokota&G4PIpw=S0l0K0t4&src=SKK&dst=62811820738&msg=TestFirstWAP
   */
  sendMessage: function(msg, dst) {
    var basePath = '/smsapi/pages/sendSmsLatin.do?g3p4i=solokota&G4PIpw=S0l0K0t4&src=SKK';
    if(msg && dst){

      console.log('To: ' + dst + ' ' + msg);

      var options = {
          host: '202.155.119.168'
        , port: 8080
        , path: basePath + '&dst=' + dst + '&msg=' + msg
        , method: 'GET'
      }

      var req = http.request(options, function(res){
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.on('data', function(chunk){
          console.log('BODY: ' + chunk);
        });
        return true;
      });
      req.end();
    } else {
      return false;
    }
  },

  /**
   * Saves a message
   */
  saveMessage: function(Sms, date, src, dst, enc, msg) {
    var sms = new Sms({
        date: date
      , src: src
      , dst: dst
      , enc: enc
      , msg: msg
    });
    sms.save();
  }

};

