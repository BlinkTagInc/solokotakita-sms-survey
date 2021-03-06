var $ = require('jquery');

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
  $.getJSON('/api/incoming', {
    src: src,
    dst: '6285777282036',
    enc: '0',
    test: 'true',
    msg: msg
  }, function(data){
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


/* Test Survey Page */
$('#tester').submit(function() {
  $('#tester input[type="submit"]').hide();
  $('#tester input').attr('disabled', 'disabled');
  $('#answers').show();
  getNextQuestion($('#tester .src').val(), 'start');
  return false;
});

$('#answers').submit(function() {
  var answer = $('#answers .answer').val();
  $('#answers .answer').val('');

  $('<div>')
    .addClass('answer')
    .html('A: ' + answer)
    .appendTo('#questions');
  getNextQuestion($('#tester .src').val(), answer);
  return false;
});

$('#testSMS').submit(function() {
  $.post('/api/sms-test', {dst: $('[name="dst"]', this).val()}, function(data) {
    console.log(data);

    if(data && data.status === 'success') {
      $('#smsResults').removeClass().addClass('alert alert-success').text('Success: ' + data.body);
    } else {
      $('#smsResults').removeClass().addClass('alert alert-danger').text('Error: ' + data.body);
    }
  });
  return false;
});


/* Results Page */
if(typeof kelurahan !== 'undefined') {
  var kelurahanSelect = $('<select>').append($('<option>').html('All'));

  $.getJSON('/api/kelurahans', function(kelurahans){
    $.each(kelurahans, function(i, kel){
      $('<option>')
        .html(kel)
        .attr((kelurahan && kel.toLowerCase() == kelurahan) ? 'selected' : 'none', '')
        .appendTo(kelurahanSelect);
    });
    $('#kelurahans').append(kelurahanSelect);

    $('#kelurahans select').on('change', function(){
      window.location = '/results/' + $(this).val().toLowerCase();
    });
  });
}
