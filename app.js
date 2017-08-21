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
const WechatAPI = require('co-wechat-api');

const index = require('./routes/index')
const users = require('./routes/users')

//开发用配置文件
const config = configInfo.test
//api
const api = new WechatAPI(config.appid, config.appsecret);
//菜单
const menu=configInfo.menu
  
let createMenu = async (ctx, next) => {
    let menuRes = await api.createMenu(menu)
    let followerRes = await api.getFollowers();
    let usersInfo = await api.batchGetUsers(followerRes.data.openid)
   // let sendInfo = await api.massSendText('第三次群发', followerRes.data.openid);
    console.log('结果', menuRes,followerRes,usersInfo)
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

let getSongID= (name) => {
  return new Promise((resolve,reject) => {      
    axios.get('https://api.imjad.cn/cloudmusic/', {params: {type:'search',search_type:'1',s:name}})
    .then((response) => {
      resolve(response) 
    })
  })
}
let getSong= (ID) => {
  return new Promise((resolve,reject) => {      
    axios.get('https://api.imjad.cn/cloudmusic/', {params: {type:'song',id:ID,br:'128000'}})
    .then((response) => {
      resolve(response) 
    })
  })
}
let getMVID= (name) => {
  return new Promise((resolve,reject) => {      
    axios.get('https://api.imjad.cn/cloudmusic/', {params: {type:'search',search_type:'1004',s:name}})
    .then((response) => {
      resolve(response) 
    })
  })
}
let getMV= (ID) => {
  return new Promise((resolve,reject) => {      
    axios.get('https://api.imjad.cn/cloudmusic/', {params: {type:'mv',id:ID}})
    .then((response) => {
      resolve(response) 
    })
  })
}
let getLyricID= (name) => {
  return new Promise((resolve,reject) => {      
    axios.get('https://api.imjad.cn/cloudmusic/', {params: {type:'search',search_type:'1',s:name}})
    .then((response) => {
      resolve(response) 
    })
  })
}
let getLyric= (ID) => {
  return new Promise((resolve,reject) => {      
    axios.get('https://api.imjad.cn/cloudmusic/', {params: {type:'lyric',id:ID}})
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
  //订阅回复
  if(message.Event === 'subscribe'){
    return {
      content: `感谢你的关注😄`,
      type: 'text'
    };
  } else {
      //菜单点击回复
      if  (message.EventKey && message.EventKey === 'menuClick'){
        return {content: '点击了菜单按钮',type: 'text'}
      }
      //用户第一次的回复
      if (userInfo.userList.indexOf(message.FromUserName)===-1){
        let usersInfo = await api.batchGetUsers([message.FromUserName])
        axios.get('http://shenyu1996-test.goiot.cc/wechat', {params: usersInfo})
        .then((response) => {})
        userInfo.userList.push(message.FromUserName)
        return {content: '1. 输入“##”可以与机器人图图聊天哦 \n2. 试试回复 ‘搜歌#告白气球’ \n3. 试试回复 ‘搜MV#告白气球’ \n4. 试试回复 ‘搜歌词#告白气球’'
      ,type: 'text'}
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
        let resID = await getMVID(message.Content.substring(4))
        let mv = await getMV(resID.data.result.mvs[0].id)
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
        let resID = await getSongID(message.Content.substring(3))
        let song = await getSong(resID.data.result.songs[0].id)
        console.log(song.data.data[0].url)
        return {
          title: resID.data.result.songs[0].name,
          description: `歌手：${resID.data.result.songs[0].ar[0].name}`,
          musicUrl: song.data.data[0].url,
          hqMusicUrl: song.data.data[0].url
        }
      }
      if (message.Content.indexOf('搜歌词#') === 0) {
        let resID = await getLyricID(message.Content.substring(4))
        let lyric = await getLyric(resID.data.result.songs[0].id)
        return {content: `歌名: ${resID.data.result.songs[0].name} 歌手: ${resID.data.result.songs[0].ar[0].name}\n${lyric.data.lrc.lyric}`,type: 'text'}
      }
    }
    return {content: `你输入了:${message.Content} 输入类型：${message.MsgType} 事件类型：${message.Event}`,type: 'text'}
}));


module.exports = app
