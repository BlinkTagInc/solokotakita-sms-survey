var mongoose = require('mongoose');

var Sms = mongoose.model('Sms', new mongoose.Schema({
      date               :  { type: String, index: true }
    , src                :  { type: String }
    , dst                :  { type: String }
    , enc                :  { type: String }
    , msg                :  { type: String }
  }, {strict:true}));
