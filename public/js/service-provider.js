// 请求数据
$.get(
  'http://localhost:3000/daowei/serviceProvider',
  function (data) {
    if (data.status === 1) {
      // 请求成功
      // 基于模板名渲染模板
      var html = template('temp-serviceList', {
        serviceProviders: data.serviceProviders
      });
      $('#serviceList').append(html);
    }
  },
  'json'
);

// 热门城市数据
$.get(
  'http://localhost:3000/daowei/hotCity',
  function (data) {
    if (data.status === 1) {
      // 请求成功
      // 基于模板名渲染模板
      var html = template('temp-hotCity', {
        hotCitys: data.hotCitys
      });
      $('#hotCity').append(html);
    }
  },
  'json'
);
