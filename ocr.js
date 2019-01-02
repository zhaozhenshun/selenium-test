const fetch = require('./service/fecth')
const fs = require('fs')
const appKey = "c7osKeZuTEiGtPTGBrLUnIUK"
const secretKey = "2cBy31AVIOXgpYbeEy8AvYMicyEQhtEU"
class OCR {
  constructor() {
    this.ready = false
    this.keyIndex = 0
    console.log('ocr--->')
    fs.existsSync('./token') ? this.access_token = fs.readFileSync('./token') : this.init()
  }
  async init () {
    let res = await this.getToken()
    res = JSON.parse(res)
    console.log('获取taoken成功', res.access_token)
    this.access_token = res.access_token
    fs.writeFileSync('./token', res.access_token)
  }
  getToken () {
    return fetch.get(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${appKey}&client_secret=${secretKey}`)
  }
  recognize (options) {
    let defaultOption = {
      language_type: 'ENG'
    }
    return fetch.post('https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' +
      this.access_token, Object.assign(defaultOption, options))
  }
}
module.exports = new OCR()
