const router = require('koa-router')()
const WechatAPI = require('co-wechat-api');
const configInfo = require('../config')
//开发用配置文件
const config = configInfo.test



router.prefix('/admin')

router.post('/',async (ctx, next) => {
  console.log(ctx.request.body)
  const api = new WechatAPI(ctx.request.body.appid, ctx.request.body.appsecret);
  let param = {
    debug: true,
    jsApiList: ['onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'startRecord',
                'stopRecord',
                'onVoiceRecordEnd',
                'playVoice',
                'pauseVoice',
                'stopVoice',
                'onVoicePlayEnd',
                'uploadVoice',
                'downloadVoice',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'translateVoice',
                'getNetworkType',
                'openLocation',
                'getLocation',
                'hideOptionMenu',
                'showOptionMenu',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay',
                'openProductSpecificView',
                'addCard',
                'chooseCard',
                'openCard'],
    url: 'http://k1r5560136.51mypc.cn/'
   };
   
  let wxConfig = await api.getJsConfig(param)
  ctx.body = wxConfig
})





router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
