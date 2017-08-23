const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const wechat = require('co-wechat');
const configInfo = require('./config')
const userInfo = require('./userInfo')
const axios = require('axios')
const WechatAPI = require('co-wechat-api')
const getRebot = require('./api/getRebot')
const getID = require('./api/getID')
const getContent = require('./api/getContent')


const moment = require('moment')
const cors = require('koa2-cors');

const admin = require('./routes/admin')
const users = require('./routes/users')

//开发用配置文件
const config = configInfo.test
//api
const api = new WechatAPI(config.appid, config.appsecret);
//菜单配置文件
const menu=configInfo.menu
  
let createMenu = async (ctx, next) => {
    let menuRes = await api.createMenu(menu)
    let followerRes = await api.getFollowers();
    let usersInfo = await api.batchGetUsers(followerRes.data.openid)
   // let sendInfo = await api.massSendText('第三次群发', followerRes.data.openid);
    console.log('结果', menuRes,followerRes,usersInfo)
}
//createMenu()


// error handler
onerror(app)

app.use(cors());

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`耗时：${ms}ms  时间：${moment(new Date).format("YYYY-MM-DD HH:mm:ss")}`)
})

app.use(admin.routes(), admin.allowedMethods())
app.use(users.routes(), users.allowedMethods())

//wechat
app.use(wechat(config).middleware(async (message,ctx) => {
  console.log(JSON.stringify(message))
  //订阅回复
  if(message.Event === 'subscribe'){
    //用户第一次关注
    if (userInfo.userList.indexOf(message.FromUserName)===-1){
      userInfo.userList.push(message.FromUserName)

      //发送邮件
     /*  let usersInfo = await api.batchGetUsers([message.FromUserName])
      axios.get('http://shenyu1996-test.goiot.cc/wechat', {params: usersInfo})
      .then((response) => {}) */
    }
    return {
      content: 
`感谢你的关注😄
1. 输入“##”可以与机器人图图聊天哦
2. 试试回复 ‘搜歌#告白气球’
3. 试试回复 ‘搜MV#告白气球’ 
4. 试试回复 ‘搜歌词#告白气球’`,
      type: 'text'
    };
  } else {
            //菜单点击回复
            if  (message.EventKey && message.EventKey === 'menuClick'){
              return {content: '点击了菜单按钮',type: 'text'}
            }
            if(message.Content === '##') {
              userInfo.ifRebot[message.FromUserName] = true
              return {content: '可以与机器人聊天啦，输入“**”退出',type: 'text'}
            }
            if(message.Content === '**') {
              userInfo.ifRebot[message.FromUserName] = false
              return {content: '已退出机器人聊天',type: 'text'}
            }
            //是否使用机器人回复
            if (userInfo.ifRebot[message.FromUserName]) {
              let response = await getRebot(message)
              console.log(JSON.stringify(response.data));
              return {content: response.data.text,type: 'text'}
            }
            //回复MV
            if (message.Content.indexOf('搜MV#') === 0) {
              let resID = await getID(message.Content.substring(4), '1004')
              let mv = await getContent(resID.data.result.mvs[0].id, 'mv')
              let url = mv.data.data.brs['720'] || mv.data.data.brs['480']
              console.log('mvurl',url)
              //console.log(mv.data.data.brs)
              return [
                {
                  title: mv.data.data.name,
                  description: mv.data.data.desc,
                  picurl: mv.data.data.cover,
                  url: url
                }
              ]
            }
            if (message.Content.indexOf('搜歌#') === 0) {
              let resID = await getID(message.Content.substring(3), '1')
              let song = await getContent(resID.data.result.songs[0].id,'song')
              console.log(song.data.data[0].url)
              return {
                title: resID.data.result.songs[0].name,
                description: `歌手：${resID.data.result.songs[0].ar[0].name}`,
                musicUrl: song.data.data[0].url,
                hqMusicUrl: song.data.data[0].url
              }
            }
            if (message.Content.indexOf('搜歌词#') === 0) {
              let resID = await getID(message.Content.substring(4), '1')
              let lyric = await getContent(resID.data.result.songs[0].id,'lyric')
              return {content: `歌名: ${resID.data.result.songs[0].name} 歌手: ${resID.data.result.songs[0].ar[0].name}\n${lyric.data.lrc.lyric}`,type: 'text'}
            }
          }
          return {content: `你输入了:${message.Content} 输入类型：${message.MsgType} 事件类型：${message.Event} http://k1r5560136.51mypc.cn/`,type: 'text'}
}));


module.exports = app
