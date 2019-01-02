const request = require('request-promise')
let defaultOption = {
  method: 'GET',
  uri: '',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
}
const fecth = {}
// Get
fecth.get = (url) => {
  let options = Object.assign({}, defaultOption, { uri: url })
  console.log('get--->options:----》', JSON.stringify(options))
  return request(options)
}
fecth.post = (url, data) => {
  let options = Object.assign({}, defaultOption, { uri: url, formData: data, method: 'POST' })
  return request.post(options)
}
// 设置头
fecth.setCookies = (optionsStr) => {
  let r = request.cookie(optionsStr)
  request.defaults({ jar: r })
}
// 设置header
fecth.setHeaders = (options) => {
  Object.assign(defaultOption.headers, options)
}
module.exports = fecth
