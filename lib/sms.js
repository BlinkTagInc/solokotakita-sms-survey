var nconf = require('nconf');
var moment = require('moment');
var request = require('request');

var errorCodes = {
  '0': 'Internal error',
  '1': 'Invalid destination number',
  '2': 'Incorrect syntax or missing parameters',
  '3': 'Invalid user name or password',
  '4': 'Sender ID is not authorized',
  '5': 'Unauthorized IP address',
  '6': 'Account is disabled',
  '7': 'Insufficient credits',
  '8': 'Maximum length (11 characters) alphanumeric exceeded'
};

module.exports = {

  /**
   * Sends a message
   * @param {String} msg The message to be sent
   * @param {Int} dst The destination phone number
   * http://gpiv2.1rstwap.com:8080/smsapi/pages/sendSmsLatin.do?g3p4i=user&G4PIpw=pass&src=SKK&dst=62811820738&msg=Test
   */
  sendMessage: function(msg, dst, cb) {
    if(!msg || !dst) {
      return cb(new Error('No `msg` or `dst` provided'));
    }

    console.log('To: ' + dst + ' ' + msg);

    request.get({
      url: 'http://gpiv2.1rstwap.com:8080/smsapi/pages/sendSmsLatin.do',
      qs: {
        g3p4i: nconf.get('SMS_USERNAME'),
        G4PIpw: nconf.get('SMS_PASSWORD'),
        src: nconf.get('SMS_SENDER_ID'),
        dst: encodeURIComponent(dst),
        msg: encodeURIComponent(msg)
      },
      followRedirect: false,
      rejectUnauthorized: false,
      requestCert: true
    }, function(e, response, body) {
      var results;

      if(body && body.length === 1) {
        results = {
          status: 'error',
          body: body + ' - ' + errorCodes[body]
        };
      } else {
        results = {
          status: 'success',
          body: body
        };
      }

      cb(e, results);
    });
  }
};
