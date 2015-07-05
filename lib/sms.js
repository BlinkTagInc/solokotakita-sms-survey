var nconf = require('nconf');
var moment = require('moment');
var request = require('request');

module.exports = {

  /**
   * Sends a message
   * @param {String} msg The message to be sent
   * @param {Int} dst The destination phone number
   * http://202.155.119.168:8080/smsapi/pages/sendSmsLatin.do?g3p4i=solokota&G4PIpw=S0l0K0t4&src=SKK&dst=62811820738&msg=TestFirstWAP
   */
  sendMessage: function(msg, dst, cb) {

    if(msg && dst){
      console.log('To: ' + dst + ' ' + msg);

      console.log({
        g3p4i: nconf.get('SMS_USERNAME'),
        G4PIpw: nconf.get('SMS_PASSWORD'),
        src: nconf.get('SMS_SENDER_ID'),
        dst: encodeURIComponent(dst),
        msg: encodeURIComponent(msg)
      })

      request.get({
        url: 'http://202.155.119.168/smsapi/pages/sendSmsLatin.do',
        qs: {
          g3p4i: nconf.get('SMS_USERNAME'),
          G4PIpw: nconf.get('SMS_PASSWORD'),
          src: nconf.get('SMS_SENDER_ID'),
          dst: encodeURIComponent(dst),
          msg: encodeURIComponent(msg)
        },
        proxy: nconf.get('PROXIMO_URL'),
        followRedirect: false,
        rejectUnauthorized: false,
        requestCert: true
      }, function(e, response, body) {
        if(e) console.log(e);
        console.log(body);
      });
    }
  }
};
