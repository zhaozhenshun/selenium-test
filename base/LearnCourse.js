const fetch = require('../service/fecth')
const { By, until } = require('selenium-webdriver');
const cherio = require('cherio')
const saveVideoLearnDetailRecord = 'http://cgjx.jsnu.edu.cn/learnspace/course/study/learningTime_saveVideoLearnDetailRecord.action';
const saveVideoLearnTimeLongRecord = 'http://cgjx.jsnu.edu.cn/learnspace/course/study/learningTime_saveVideoLearnTimeLongRecord.action';
// 提交答案1
const autoSubmitPaper = 'http://cgjx.jsnu.edu.cn/learnspace/course/test/coursewareTest_autoSubmitPaper.action'
// 提交答案2
const handerSubmitPaper = 'http://cgjx.jsnu.edu.cn/learnspace/course/test/coursewareTest_handSubmitPaper.action'
// 获取答案
const TestAnswerPage = 'http://cgjx.jsnu.edu.cn/learnspace/course/test/coursewareTest_intoTestAnswerPage.action?itemId='
// 出题
const MakeSubjectPage = 'http://cgjx.jsnu.edu.cn/learnspace/course/test/coursewareTest_intoRedoTestPage.action?'
/*?params.itemId='+itemId+'&params.courseId='+courseId+'&params.historyId='+historyId;'
http://cgjx.jsnu.edu.cn/learnspace/course/test/coursewareTest_intoRedoTestPage.action?params.itemId=ff80808160c464d20160d343091b055b&params.courseId=ff8080815ec85549015ee1d745e70262&params.historyId=ff80808167c0a4850167cb5d52d62dd7
*/
class LearnCourse {
  constructor() {
  }
  static async seeVideo (courseId, itemId) {
    console.log(`seeVideo:courseId${courseId};itemId${itemId}`)
    let param = {
      'videoStudyRecord.courseId': courseId,
      'videoStudyRecord.itemId': itemId,
      'videoStudyRecord.startTime': '00: 00: 00',
      'videoStudyRecord.endTime': '00: 50: 00',
      'videoStudyRecord.videoIndex': 0,
      'videoStudyRecord.studyTimeLong': 3000
    };
    let param2 = {
      'courseId': courseId,
      'itemId': itemId,
      'studyTime': 5000,
      'resourceTotalTime': '00: 20: 23'
    };
    const fechRes  = await fetch.post(saveVideoLearnTimeLongRecord, param2)
    let result = (await fetch.post(saveVideoLearnDetailRecord, param)).success
    console.log(`video--end${fechRes},${result}`)
    return Promise.resolve(result)
  }
  static async doTest (driver) {
    // 先定位元素
    await driver.wait(until.elementLocated(By.id('mainFrame')), 20000)
    await driver.switchTo().frame('mainFrame')  // 切到mainFrame
    try {
      await driver.wait(until.elementLocated(By.id('current_testId')), 2000)
    } catch (e) {
        console.log(e)
    }
    let title = await driver.getTitle()
    console.log('title', console.log(title))
   
    // flag  true  没有提交   false 已做过
    let pageInfo = await driver.executeScript(`
      var paperInfo = {};
      var testId = $('#current_testId').val();
      var itemId = $('#current_itemId').val();
      var courseId = $('#current_courseId').val();
      var historyId = $('#current_historyId').val();
      var flag = $('#current_flag').val();
      paperInfo.testId = testId
      paperInfo.itemId = itemId
      paperInfo.courseId = courseId
      paperInfo.historyId = historyId
      paperInfo.flag = ($('.checkanswer').length == 0)
      paperInfo.href = window.location.href
      return paperInfo
    `);
    console.log('paperInfo--->', JSON.stringify(pageInfo))
    if (pageInfo.flag === true && pageInfo.itemId) {
      console.log('进入开始答题')
      await driver.sleep(5000)
      // 出题
      let paramQuery = `params.itemId=${pageInfo.itemId}&params.courseId=${pageInfo.courseId}&params.historyId=${pageInfo.historyId}`
      let subjectHtml = await fetch.get(MakeSubjectPage + paramQuery)
      console.log('subjectHtml---->', subjectHtml)
      // 获取答案
      let answers = await fetch.get(TestAnswerPage + pageInfo.itemId)
      let $ = cherio.load(answers)
      let answersList = []
      $('.test_item_key_tit').each(function (i, elem) {
        let ast = $(this).text().split("：")[1]
        answersList.push(ast)
      })
      let result = answersList.toString().replace(/,/g, '|')
      console.log('我得答案----->', result)
      // 提交答案
      let success = (await fetch.post(autoSubmitPaper, {
        testId: pageInfo.testId,
        itemId: pageInfo.itemId,
        historyId: pageInfo.historyId,
        myAnswers: result
      })).success
      console.log('success---->', success)
      let handerSuccess = (await fetch.post(handerSubmitPaper, {
        testId: pageInfo.testId,
        itemId: pageInfo.itemId,
        historyId: pageInfo.historyId,
        myAnswers: result
      }))
      console.log('hander---success---->', handerSuccess)
      let finalResult = await fetch.get(TestAnswerPage + pageInfo.itemId + '&flag=true')
    }
    // 切回去---->
    await driver.switchTo().defaultContent()
    await driver.switchTo().frame('mainContent')
    console.log('切换成功------>')
    return Promise.resolve()
  }
}
module.exports = LearnCourse
