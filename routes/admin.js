const router = require('koa-router')()
const WechatAPI = require('co-wechat-api');
const configInfo = require('../config')
//开发用配置文件
const config = configInfo.test
//api
const api = new WechatAPI(config.appid, config.appsecret);

router.prefix('/admin')

router.get('/',async (ctx, next) => {
  let param = {
    debug: true,
    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
    url: 'http://k1r5560136.51mypc.cn/'
   };
   
  let wxConfig = await api.getJsConfig(param)
  ctx.body = wxConfig
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
