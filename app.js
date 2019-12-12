const fetch = require('./service/fecth')
const fs = require('fs')
const {
  Builder,
  By,
  Key,
  until,
  Browser
} = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
const OCR = require('./ocr')
const ReadCourse = require('./base/ReadCourse')
const driver = new Builder().forBrowser(Browser.CHROME).build();
// 设置cookie
let expiry = new Date(Date.now() + (10 * 60 * 1000));
let cookie = null
driver.manage().window().maximize()
driver.get('http://cgjx.jsnu.edu.cn/sso/login_loginPage.action').then(() => {
  cookie = driver.manage()
  console.log(driver)
  // initData()
  initLogin()
})
Array.prototype.remove = function (val) {
  var index = this.indexOf(val)
  if (index > -1) {
    this.splice(index, 1)
  }
}
// 初始登陆
async function initLogin() {
  console.log('initLogin')
  await driver.switchTo().frame('center')
  let username = await driver.findElement(By.id('loginId'))
  let password = await driver.findElement(By.id('passwd'))
  let authCode = await driver.findElement(By.id('authCode'))
  let imgCode = await driver.findElement(By.id('imgCode'))
  let Login_btn = await driver.findElement(By.id('Login_btn'))
  username.sendKeys('1118540720184') //账号 
  password.sendKeys('qyq940627') // 密码
  let codeurl = await imgCode.getAttribute('src')
  let base64Str = await driver.executeScript(`
    function getBase(img) {
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      var dataURL = canvas.toDataURL("image/jpg");
      return dataURL
    }
    return getBase(arguments[0])
  `, imgCode)
  console.log('center', codeurl)
  let res = await OCR.recognize({
    image: base64Str.replace(/data:image\/([a-zA-Z]+);base64,/i, ''),
  })
  console.log('recognize', res)
  res = JSON.parse(res)
  authCode.sendKeys(res.words_result[0].words)
  await driver.sleep(1000)
  Login_btn.click()
  await driver.sleep(6000)
  dealHomePage()
}
// 获取cookie为后续request做做准备
async function getCookie() {}

async function dealHomePage() {
  await driver.switchTo().defaultContent()
  await driver.wait(until.elementLocated(By.id('info_main')), 20000)
  // const info_main = await driver.findElement(By.id('info_main'))
  await driver.switchTo().frame('info_main')
  await driver.wait(until.elementLocated(By.id('info_course')), 20000)
  await driver.switchTo().frame('info_course')
  let url = await driver.getCurrentUrl()
  console.log(url, 'driver.getCurrentUrl')
  let aList = await driver.executeScript(`
    var arr = [];
    $(".imgList a").each(function(){
      arr.push($(this).attr("href"))
    });
    console.log(arr)
    return arr;
  `)
  fs.writeFileSync('./course.json', JSON.stringify(aList))
  console.log(JSON.stringify(aList))
  readCourse()
}
/**
 * 开始便利课程菜单 模拟点击
 */
async function readCourse() {
  new ReadCourse(driver)
}