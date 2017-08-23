const axios = require('axios')
module.exports= (message) => {
//调用机器人
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
