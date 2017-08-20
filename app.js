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
let WechatAPI = require('co-wechat-api');

const index = require('./routes/index')
const users = require('./routes/users')

//开发用配置文件
const config = configInfo.test


const menu={
  "button":[
    {
      "type":"click",
      "name":"夏日伤痕",
      "key":"V1001_TODAY_MUSIC"
    },
    {
      "name":"菜单",
      "sub_button":[
        {
          "type":"view",
          "name":"关于我",
          "url":"http://www.summerscar.me/"
        },
        {
          "type":"click",
          "name":"测试",
          "key":"V1001_GOOD"
        }
      ]
    }
  ]
}
  
let createMenu = async (ctx, next) => {
    let api = new WechatAPI(config.appid, config.appsecret);
    let result = await api.createMenu(menu)
  console.log(result)
}
//createMenu()

//调用机器人
let getRebot= (message) => {
  return new Promise((resolve,reject) => {
    let obj = {        
      key: 'b6861e7aa4414a21abf4c72de7bd807c',
      info: message.Content,              
      userid: message.FromUserName
    }        
    axios.get('http://www.tuling123.com/openapi/api', {params: obj})
    .then((response) => {
    resolve(response) 
    })
  })
}

// error handler
onerror(app)

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
  console.log(`耗时：${ms}ms`)
})

app.use(index.routes(), index.allowedMethods())

//wechat
app.use(wechat(config).middleware(async (message,ctx) => {
  console.log(JSON.stringify(message))
  if(message.Event === 'subscribe'){
    return {
      content: `感谢你的关注😄`,
      type: 'text'
    };
  } else {
    if (userInfo.userList.indexOf(message.FromUserName)===-1){
      userInfo.userList.push(message.FromUserName)
      return {content: '输入“##”可以与机器人图图聊天哦',type: 'text'}
    }
    if(message.Content === '##') {
      userInfo.ifRebot[message.FromUserName] = true
      return {content: '可以与机器人聊天啦，输入“**”退出',type: 'text'}
    }
    if(message.Content === '**') {
      userInfo.ifRebot[message.FromUserName] = false
      return {content: '已退出机器人聊天',type: 'text'}
    }
    if (userInfo.ifRebot[message.FromUserName]) {
      let response = await getRebot(message)
      console.log(JSON.stringify(response.data));
      return {content: response.data.text,type: 'text'}
    }
    return {content: `你输入了:${message.Content} 输入类型：${message.MsgType} 事件类型：${message.Event}`,type: 'text'}
}
}));


module.exports = app
