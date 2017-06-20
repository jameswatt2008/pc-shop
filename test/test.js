// 热门城市接口
router.get('/hotCity', function (req, res) {
  superagent.get(baseUrl).end(function (err, response) {
    var $ = cheerio.load(response.text);

    var hotCitys = [];
    $('.footer dd i').each(function (index, el) {
      hotCitys.push($(el).text())
    })

    res.json({
      status: 1,
      hotCitys: hotCitys
    });
  })
});