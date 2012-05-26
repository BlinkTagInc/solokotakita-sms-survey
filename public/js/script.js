// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){ log.history = log.history || []; log.history.push(arguments); if(this.console) { var args = arguments, newarr; args.callee = args.callee.caller; newarr = [].slice.call(args); if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);}};

// make it safe to use console.log always
(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());


function getTimestamp(){
  var now = new Date();
  var timestamp = now.getFullYear() + '-' +
                  ('0' + (now.getMonth()+1)).slice(-2) + '-' +
                  ('0' + now.getDate()).slice(-2) + ' ' +
                  ('0' + now.getHours()).slice(-2) + ':' +
                  ('0' + now.getMinutes()).slice(-2) + ':' +
                  ('0' + now.getSeconds()).slice(-2);
  return timestamp;
}

function getNextQuestion(src){
  $.getJSON('/api/nextQuestion'
          , {src: src}
          , function(question){
            console.log(question);
            if(question.number <= question.count){
              $('<div>')
                .addClass('question')
                .html('Q' + question.number + ': ' + question.question)
                .appendTo('#questions');
            } else {
              $('<div>')
                .addClass('alert alert-success')
                .html(question.question)
                .appendTo('#questions');
              $('#answers').hide();
            }
          });
}


$(document).ready(function(){

  $('#tester').submit(function(){
    $('#tester input[type="submit"]').hide();
    $('#tester input').attr('disabled', 'disabled');
    $('#answers').show();
    $.ajax({
        url: '/api/incoming'
      , dataType: 'xml'
      , data: {
                  src: $('#tester .src').val()
                , dst: '6289676076213'
                , date: getTimestamp()
                , msg: 'start'
                , test: true
              }
      , success: function(data){ getNextQuestion($('#tester .src').val()); }
    });
    return false;
  });

  $('#answers').submit(function(){
    var answer = $('#answers .answer').val();
    $('#answers .answer').val('');

    $('<div>')
      .addClass('answer')
      .html('A: ' + answer)
      .appendTo('#questions');

    $.ajax({
        url: '/api/incoming'
      , dataType: 'xml'
      , data: {
                  src: $('#tester .src').val()
                , dst: '6289676076213'
                , date: getTimestamp()
                , msg: answer
                , test: true
              }
      , success: function(data){
                  getNextQuestion($('#tester .src').val()); 
                 }
    });
    return false;
  });



});
