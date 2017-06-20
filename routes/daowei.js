var router = require('express').Router();

// node自带的模块
const path = require('path');
const url = require('url');
const fs = require('fs');

// npm安装的依赖库
const superagent = require('superagent');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy');
const async = require('async');
// const mkdir = require('mkdirp')

// 目标URL
var baseUrl = 'http://www.daoway.cn/';

// 服务商商家 服务列表
//http:www.daoway.cn/fuwushang?serviceId=800ff6443dd043b39c7f17ede21dfc9d
router.get('/fuwushang', function (req, res) {
  //设置cors跨域响应头
  res.set('Access-Control-Allow-Origin', '*');

  // 请求参数
  var serviceId = req.query.serviceId;

  // 拼接url
  var url = baseUrl + 'fuwushang?serviceId=' + serviceId;
  superagent.get(url)
    .end(function (err, response) {
      var $ = cheerio.load(response.text);

      var companyInfo = {};
      // 商家名
      companyInfo.serviceName = $('.htit-left').children().eq(0).text();

      // 营业时间
      companyInfo.serviceTime = $('.htit-left').children().eq(1).find('em').text();

      // 预约时间
      companyInfo.serviceAppointmentTime = $('.htit-left').children().eq(2).find('em').text();

      // 成功接单25084
      companyInfo.serviceOrder = $('.htit-right ul li i').eq(0).text();

      // 接单率94%
      companyInfo.serviceOrderRate = $('.htit-right ul li i').eq(1).text();

      // 好评率
      companyInfo.serviceGoodRate = $('.htit-right ul li i').eq(2).text();

      // 公司
      companyInfo.company = $('.company').text();

      // 公司简介
      companyInfo.serviceDescription = $('.profile').attr('innertext');

      // 评论总数
      companyInfo.commentCount = $('.paihang em').text();

      // 服务项目列表
      var serviceItems = [];
      $('.ctop').each(function (index, el) {
        var item = {};

        // id
        item.detailId = $(el).attr('id');
        // 图片
        item.pic = $(el).find('.pic').attr('src');
        // 名字
        item.name = $(el).find('.spm').children('i').eq(0).text();
        //　描述
        item.desc = $(el).find('.spm').children('i').eq(1).text();

        // 现价 30元/小时
        var str = $(el).find('.price').children().first().text();
        item.priceDes = $(el).find('.price').children().first().find('em').text();
        item.price = str.replace(item.priceDes, '');

        // 原价
        item.oldPrice = $(el).find('.oldpic em').text();
        // 已售
        item.sale = $(el).find('.spf').text();

        serviceItems.push(item);
      });

      // 用户评论
      var comments = [];
      $('.conmentss').each(function (index, el) {
        var comment = {};

        // 头像
        var avatarStr = $(el).children().first().attr('src');
        comment.avatar = avatarStr.startsWith('pcimages') ? 'http://www.daoway.cn/' + avatarStr : avatarStr;

        // 名字
        comment.username = $(el).find('ul li').eq(0).text();

        // 时间
        comment.time = $(el).find('ul li').eq(1).find('em').text();

        // 评论内容
        comment.content = $(el).find('.commentdetail').text();

        // 定位
        comment.location = $(el).find('.commentposition').text();

        comments.push(comment);

        // 遍历完成
        if (index === $('.conmentss').length - 1) {
          // 响应数据
          res.json({
            status: 1,
            companyInfo: companyInfo,
            serviceItems: serviceItems,
            comments: comments
          })
        }
      })
    });
});

// 详情接口
//http:www.daoway.cn/detail?detailId=56611&CNtag=%E5%AE%B6%E5%BA%AD%E4%BF%9D%E6%B4%81
router.get('/detail', function (req, res) {
  //设置cors跨域响应头
  res.set('Access-Control-Allow-Origin', '*');

  // 请求参数
  var detailId = req.query.detailId;
  // 需要对字符进行urlencode编码，不然没法数据抓取
  var CNtag = encodeURI(req.query.CNtag);

  //http:www.daoway.cn/detail?detailId=56611&CNtag=%E5%AE%B6%E5%BA%AD%E4%BF%9D%E6%B4%81
  var url = baseUrl + 'detail?detailId=' + detailId + '&CNtag=' + CNtag;
  superagent.get(url)
    .end(function (err, response) {
      var $ = cheerio.load(response.text);

      var obj = {};

      // 分类
      obj.categoryId = $('#categoryId').text();

      // 子类
      obj.cnav = $('.cnav').text();

      // 服务图片
      obj.pic = $('#curauto .pic').attr('src');

      // 服务名
      obj.name = $('.spm').children('i').first().text();

      // 现价 30元/小时
      var str = $('.spm').children('i').eq(1).children().first().text();
      obj.priceDes = $('.spm').children('i').eq(1).children().first().find('em').text();
      obj.price = str.replace(obj.priceDes, '');

      // 原价
      obj.oldPrice = $('.spm').children('i').eq(1).children().last().find('em').text();

      // 已售
      obj.sale = $('.yishou').text();

      // 服务描述
      var str = $('#servicePriceDescription').attr('innertext');
      if (str) {
        obj.servicePriceDescription = str.replace(/\n/g, '<br>');
      }

      // 服务范围
      obj.serviceScope = $('.cdown').children().eq(3).text();

      // 可预约时间
      obj.serviceAppointmentTime = $('.cdown').children().eq(5).find('em').text();

      // 服务时间
      var timeStr = $('.cdown').children().eq(5).text();
      obj.serviceTime = timeStr.substring(0, timeStr.indexOf('最近可预约时间'));

      // 服务须知
      var str = $('#orderingNotice').attr('innertext');
      if (str) {
        obj.serviceNotice = str.replace(/\n/g, '<br>');
      }

      // 商家简介
      var innerText = $('#serviceDescription').attr('innertext');
      if (innerText) {
        obj.serviceDescription = innerText.replace(/\n/g, '<br>');
      }

      // 商家头像
      obj.serviceShopAvatar = $('.rightct img').attr('src');

      // 商家名
      obj.serviceName = $('.rightct p').eq(0).text();

      // 成功接单25084
      obj.serviceOrder = $('.rightct p i').eq(0).text();

      // 接单率94%
      obj.serviceOrderRate = $('.rightct p i').eq(1).text();

      // 好评率
      obj.serviceGoodRate = $('.rightct p i').eq(2).text();

      // 响应数据
      res.json({
        status: 1,
        detailData: obj
      });
    })
});

// 热门城市接口
router.get('/hotCity', function (req, res) {
  //设置cors跨域响应头
  res.set('Access-Control-Allow-Origin', '*');

  superagent.get(baseUrl)
    .end(function (err, response) {
      var $ = cheerio.load(response.text);

      // 热门城市
      var hotCitys = [];
      $('.footer dd i').each(function (index, el) {
        hotCitys.push($(el).text())
      })

      // 响应数据
      res.json({
        status: 1,
        hotCitys: hotCitys
      });
    })
});

// 服务商接口
router.get('/serviceProvider', function (req, res) {
  //设置cors跨域响应头
  res.set('Access-Control-Allow-Origin', '*');

  // 服务商页面数据抓取
  superagent.get(baseUrl + 'service/')
    .end(function (err, response) {
      var $ = cheerio.load(response.text);

      var serviceProviders = [];
      $('.ulactivety li').each(function (index, el) {
        var item = {}
        item.serviceId = $(el).attr('id');
        item.img = $(el).children().first().attr('src');
        item.name = $(el).find('p b').text();
        item.good = $(el).find('.pp i').text();
        var str = $(el).find('.pp').text();
        item.sale = str.substring(0, str.indexOf('好'))
        serviceProviders.push(item);

        // 遍历完成
        if (index == $('.ulactivety li').length - 1) {
          // 响应数据
          res.json({
            status: 1,
            serviceProviders: serviceProviders
          });
        }
      });
    })
});

// 首页接口
router.get('/home', function (req, res) {
  //设置cors跨域响应头
  res.set('Access-Control-Allow-Origin', '*');

  // 爬虫数据
  superagent.get(baseUrl)
    .end(function (err, response) {
      var $ = cheerio.load(response.text);

      // 首页轮播导航数据
      var navs = [];
      $('.banner-nav .navname').each(function (index, el) {
        var nav = {};
        nav.navname = $(el).find('i').text();
        nav.childNavs = [];
        $(el).find('ul li a').each(function (i, el) {
          nav.childNavs.push($(el).text());
        });
        navs.push(nav);
      });

      // 首页服务列表数据
      var services = [];
      $('.box1').each(function (index, el) {
        var service = {};
        // 服务标题
        service.serviceIndex = $(el).find('.serviceIndex').text();
        // 服务类型
        service.serviceType = $(el).find('.serviceType').text();
        // 服务列表数据
        service.serviceList = [];

        $(el).find('.shopList').each(function (index, el) {
          // 服务条目
          var item = {};

          // /detail?detailId=2429946&CNtag=%E5%AE%B6%E5%BA%AD%E4%BF%9D%E6%B4%81
          var hrefStr = $(el).attr('href');
          item.queryString = hrefStr.substring(hrefStr.indexOf('detailId'));

          item.serviceImg = $(el).find('.serviceImg').attr('src');
          item.serviceName = $(el).find('.serviceName').text();

          item.description = $(el).find('.description').text().replace(/\n/, ' ');
          item.price = $(el).find('.price').children('span').first().text();

          // 180元/天查看详情
          var txt = $(el).find('.price').text();

          // 元/天  将180和查看详情过滤
          var priceDes = txt.replace(parseFloat(txt), '').replace(/查看详情$/, '');
          item.priceDes = priceDes;

          service.serviceList.push(item);
        });
        services.push(service);
      });

      // 热门城市
      var hotCitys = [];
      $('.footer dd i').each(function (index, el) {
        hotCitys.push($(el).text());

        // 遍历完成
        if (index == $('.footer dd i').length - 1) {
          // 响应数据
          res.json({
            status: 1,
            bannerNavs: navs,
            services: services,
            hotCitys: hotCitys
          });
        }

      })
    })
});

module.exports = router;