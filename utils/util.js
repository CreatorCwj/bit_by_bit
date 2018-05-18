//统一toast信息展示
const showMsg = msg => {
  wx.showToast({
    title: msg,
    duration: 2000,
    icon: 'none',
  })
}

module.exports = {
  showMsg: showMsg
}
