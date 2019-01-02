const fs = require('fs')
const { URL } = require('url');
const { By, until } = require('selenium-webdriver');
const fetch = require('../service/fecth')
console.log(2222)
const LearnCourse = require('./LearnCourse')
console.log(3333)
class ReadCourse {
  constructor(driver) {
    this.courseList = JSON.parse(fs.readFileSync('./course.json'))
    this.courseId = ''
    this.driver = driver
    this.init()
  }
  async init () {
    for (let i = 0; i < this.courseList.length; i++) {
      await this.driver.executeScript(`
      window.open(arguments[0])
      `, this.courseList[i])
    }
    // 切换window
    await this.switchWindow()
    let curUrl = await this.driver.getCurrentUrl()
    await this.switchToMainContent()
    let ids = await this.getNav(curUrl)
    await this.setRequestHeader()
    // 切换点击事件
    await this.readClickEvt(ids)
    // 设置请求头
   
    console.log('ids--->', ids)
  }
  async readClickEvt (ids) {
    // 获取左边菜单
    for (let i = 0; i < ids.length; i++) {
      let itemId = ids[i].split('_')[1]
      // 点击左边垂直菜单
      await this.driver.executeScript(`
      showChildItem(arguments[1], arguments[0])
      `, this.courseId, itemId)
      await this.driver.sleep(1000)
      let menuIds = await this.driver.executeScript(`
        let arr = [];
        $(".menub").each(function(){
          var obj = {};
          obj.type = $(this).attr('menutype');
          obj.id = $(this).attr('id');
          arr.push(obj)
        })
        return arr
      `)
      console.log('menuIds', JSON.stringify(menuIds))
      fs.appendFileSync('menuIds.txt', JSON.stringify(menuIds))
      // 点击右边水平菜单
      for (let t = 0; t < menuIds.length; t++) {
        await this.driver.executeScript(`
          $('#'+arguments[0]).click()
        `, menuIds[t].id)
        /**
         * 处理视频学习资源
         */
        let menuId = menuIds[t].id.split('_')[1]
        if (menuIds[t].type == 'video') await LearnCourse.seeVideo(this.courseId, menuId)
        if (menuIds[t].type == 'test') await LearnCourse.doTest(this.driver)
      }
      await this.driver.sleep(1000)
    }
    return Promise.resolve()
  }
  async setRequestHeader () {
    let cookies = await this.driver.manage().getCookies()
    fs.writeFileSync('./cookies.json', JSON.stringify(cookies))
    let cookieArr = []
    cookies.forEach((item) => {
      cookieArr.push(item.name + '=' + item.value)
    })
    let cookStr = cookieArr.toString().replace(/,/g, ';')
    console.log(cookStr)
    let cook = {
      'Cookie': cookStr
    }
    fetch.setHeaders(cook)
    return Promise.resolve()
  }
  async switchWindow () {
    let handers = await this.driver.getAllWindowHandles()
    let homeHander = await this.driver.getWindowHandle()
    handers.remove(homeHander)
    console.log('handers-->', handers)
    await this.driver.switchTo().window(handers[3])
    return Promise.resolve()
  }
  async switchToMainContent () {
    await this.driver.wait(until.elementLocated(By.id('mainContent')), 20000)
    await this.driver.switchTo().frame('mainContent')
    return Promise.resolve()
  }
  async getNav (curUrl) {
    this.courseId = new URL(curUrl).searchParams.get("params.courseId")
    let ids = await this.driver.executeScript(`
    let arr = [];
    $('#nav .vcon li').each(function(){
      arr.push($(this).attr("id"))
    });
      return arr
    `)
    fs.writeFileSync('./courseItemIds.json', JSON.stringify(ids))
    return Promise.resolve(ids)
  }
}
module.exports = ReadCourse
