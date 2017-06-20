window.onload = function () {
  stickekHeader();

  // 粘贴的顶部
  function stickekHeader() {
    $(window).scroll(function () {
      if ($(window).scrollTop() > $('.header').outerHeight()) {
        console.log('==');
        $('.sticky-header').addClass('sticky-style');
      } else {
        $('.sticky-header').removeClass('sticky-style');
      }
    });
  }
};
