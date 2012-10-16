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

function getNextQuestion(src, msg){
  $.getJSON('/api/incoming'
          , {
                src: src
              , dst: '6289676076213'
              , enc: '0'
              , test: 'true'
              , msg: msg
            }
          , function(data){
            console.log(data);
            switch(data.status) {
              case 'start':
                $('<div>')
                  .addClass('question')
                  .html(data.question)
                  .appendTo('#questions');
                break;
              case 'end':
                $('<div>')
                  .addClass('alert alert-success')
                  .html(data.question)
                  .appendTo('#questions');
                $('#answers').hide();
                break;
              default:
                $('<div>')
                  .addClass('question')
                  .html(data.question)
                  .appendTo('#questions');
                break;
            }
          });
}


$(document).ready(function(){

  /* Test Survey Page */
  $('#tester').submit(function(){
    $('#tester input[type="submit"]').hide();
    $('#tester input').attr('disabled', 'disabled');
    $('#answers').show();
    getNextQuestion($('#tester .src').val(), 'start');
    return false;
  });

  $('#answers').submit(function(){
    var answer = $('#answers .answer').val();
    $('#answers .answer').val('');

    $('<div>')
      .addClass('answer')
      .html('A: ' + answer)
      .appendTo('#questions');
    getNextQuestion($('#tester .src').val(), answer);
    return false;
  });


  /* Results Page */
  var kelurahanSelect = $('<select>')
    .append($('<option>').html('All'));
  $.getJSON('/api/kelurahans', function(kelurahans){
    $.each(kelurahans, function(i, kel){
      $('<option>')
        .html(kel)
        .attr((kel.toLowerCase() == kelurahan) ? 'selected' : 'none', '')
        .appendTo(kelurahanSelect);
    });
    $('#kelurahans').append($(kelurahanSelect).html());
  });

  $('#kelurahans').on('change', function(){
    console.log($(this).val());
    window.location = '/results/' + $(this).val().toLowerCase();
  });

  $('#neighborhoodSelect select').on('change', function(){
    $(this).parent().submit();
  });

  $('#neighborhoodSelect').submit(function(){
    window.location = '/results/' + $('#neighborhoodSelect select:first-child option:selected').val();
    return false;
  });


});
