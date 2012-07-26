var http = require('http')
  , moment = require('moment');

module.exports = {

  /**
   * Sends a message
   * @param {String} msg The message to be sent
   * @param {Int} dst The destination phone number
   * http://202.155.119.168:8080/smsapi/pages/sendSmsLatin.do?g3p4i=solokota&G4PIpw=S0l0K0t4&src=SKK&dst=62811820738&msg=TestFirstWAP
   */
  sendMessage: function(msg, dst, cb) {
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
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
          cb(null, chunk);
        });
      });
      req.on('error', function(e) {
        cb(e);
      });
      req.end();
    }
  }

};

