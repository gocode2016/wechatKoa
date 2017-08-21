const config = {
    test: {
        token: 'summerscar',
        appid: 'wx6f0bbb70481dbf9c',
        encodingAESKey: '',
        appsecret: 'b6f0e43619be3397c110b37c93bf4466'
    },
    summerscar: {
        token: 'summerscar',
        appid: 'wx9d1c7ad28ef1c7a9',
        encodingAESKey: '14xjnSzaGXJZIrKiWJv8PQ8rDeXIBhYgU8lJtu9Jm5K',
        appsecret: 'bf96c54595b1598ddfc8f2053de9eae8'
    },
    menu: {
        "button":[
          {
            "type":"click",
            "name":"夏日伤痕",
            "key":"menuClick"
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
}
module.exports = config