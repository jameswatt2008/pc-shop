// 初始化轮播图
initSwiper();

function initSwiper() {
  new Swiper('.swiper-container', {
    loop: true,
    autoplay: 4000,
    pagination: '.swiper-pagination',
    effect: 'fade'
  });
}

// 请求首页数据
$.get(
  'http://localhost:3000/daowei/home',
  function (data) {
    if (data.status === 1) {
      // 请求成功
      // 基于模板名渲染模板
      var html = template('temp', {
        bannerNavs: data.bannerNavs,
        services: data.services,
        hotCitys: data.hotCitys
      });
      $('body').append(html);
    }
  },
  'json'
);
