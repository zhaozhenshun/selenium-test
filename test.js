const fs = require('fs');


// let menuStr = fs.readFileSync('menuIds.json')
// console.log(menuStr.toString())
// menuStr =  menuStr.toString().replace(/(\]\[)/g, ',')
// fs.writeFileSync('menuIdsTxt.json', menuStr)

async function init () {
  console.log("init")
  let r1 = await step1()
  let r2 = await step2()
  console.log(r1, r1)
  return Promise.resolve()
}
async function init2 () {
  console.log("init2")
  let r1 = await step1()
  let r2 = await step2()
  console.log(r1, r1)
  return Promise.resolve()
}
async function start () {
  let cookieArr = []
  let menuStr = JSON.parse(fs.readFileSync('cookies.json'))
  menuStr.forEach((item) => {
    cookieArr.push(item.name + '=' + item.value)
  })
  let cookStr = cookieArr.toString().replace(/,/g, ';')
  console.log(cookStr)
}
function step1 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve(1)
    }, 1000);
  })
}
function step2 () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve(2)
    }, 1000);
  })
}
start()
