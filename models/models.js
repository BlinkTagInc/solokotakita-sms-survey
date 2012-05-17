var mongoose = require('mongoose');

var Sms = mongoose.model('sms', new mongoose.Schema({
      date               :  { type: String, index: true }
    , src                :  { type: String }
    , dst                :  { type: String }
    , enc                :  { type: String }
    , msg                :  { type: String }
  }, {strict:true}));

var User = mongoose.model('user', new mongoose.Schema({
      username           :  { type: String, required: true, unique: true, trim: true }
    , password           :  { type: String, required: true }
  }, {strict: true}));
