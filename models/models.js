var mongoose = require('mongoose');

var Sms = mongoose.model('Sms', new mongoose.Schema({
      timestamp          :  { type: String, index: true }
    , text               :  { type: String }
    , senderPhone        :  { type: String }
  }, {strict:true}));
