//app.js
//初始化LeanCloud存储配置
const AV = require('./libs/av-weapp-min.js')
AV.init({
  appId: 'FuiMrXxTceLATKpO8otFdaBz-gzGzoHsz',
  appKey: 'krlfRvzRflq1lTB75wCRkqtP',
})
//初始化LeanCloud实时通信配置
const Realtime = require('./libs/realtime.weapp.min.js').Realtime
const realtime = new Realtime({
  appId: 'FuiMrXxTceLATKpO8otFdaBz-gzGzoHsz',
  appKey: 'krlfRvzRflq1lTB75wCRkqtP',
})

App({
  globalData: {
    realtime: realtime,
    refreshRecordList: false,
    userData: null,
  }
})