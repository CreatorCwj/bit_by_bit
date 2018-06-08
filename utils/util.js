//统一toast信息展示
const showMsg = msg => {
  wx.showToast({
    title: msg,
    duration: 2000,
    icon: 'none',
  })
}

//根据字符串返回0点Date对象
const getZeroDate = dateStr => {
  if (!dateStr) return null
  var date = new Date(dateStr)
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  return date
}

module.exports = {
  showMsg: showMsg,
  getZeroDate: getZeroDate,
}
