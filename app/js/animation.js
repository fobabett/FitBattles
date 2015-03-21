$(function() {
  $('button#newWeight').click(function() {
    console.log('click');
    $('img#attack').animate({
      marginTop: '-300px'
    }, 100, function() {
      $('img#attack').animate({
        marginTop: '50px'
      }, 100)
    })
  })
});