const axios = require('axios')
module.exports = (ID, type) => {
    return new Promise((resolve,reject) => {      
      axios.get('https://api.imjad.cn/cloudmusic/', {params: {type: type,id: ID,br:'128000'}})
      .then((response) => {
        resolve(response) 
      })
    })
  }