$(function() {
  $('button#newWeight').click(function() {
    console.log('click');
    $('img#attack').animate({
      top: '150px'
    }, 100)
  })
});