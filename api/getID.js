const axios = require('axios')
module.exports = (name, search_type) => {
    return new Promise((resolve,reject) => {      
        axios.get('https://api.imjad.cn/cloudmusic/', {params: {type:'search',search_type:search_type,s:name}})
        .then((response) => {
        resolve(response) 
        })
    })
}