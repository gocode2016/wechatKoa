const router = require('koa-router')()
const WechatAPI = require('co-wechat-api');
const configInfo = require('../config')
//开发用配置文件
const config = configInfo.test
//api
const api = new WechatAPI(config.appid, config.appsecret);

router.get('/admin', async (ctx, next) => {
  let param = {
    debug: true,
    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
    url: 'http://k1r5560136.51mypc.cn/'
   };
   
  let wxConfig = await api.getJsConfig(param)
  await ctx.render('index', {
    title: 'Hello Koa 2!',
    wxConfig: wxConfig
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
