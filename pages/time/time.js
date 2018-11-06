// pages/time/time.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')
const CACHE_WALLPAPER_KEY = 'wallPaperUrl'
const DEFAULT_WALLPAPER = '../../resources/images/default_image.png'

Page({

  data: {
    wallPaperUrl: '',
    daysPrefix: '',
    days: '',
    hasDays: false,
  },

  onLoad: function(options) {
    var cacheUrl = this.getCacheWallPaper()
    this.setData({
      wallPaperUrl: cacheUrl
    })
    wx.startPullDownRefresh()
  },

  onPullDownRefresh: function() {
    this.loadData()
  },

  selectDate: function(event) {
    wx.showNavigationBarLoading()
    var that = this
    var date = Util.getZeroDate(event.detail.value)
    console.log('DateObj is :' + date)
    var obj = AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId)
    obj.set('togetherDate', date)
    obj.save().then(function() {
      wx.hideNavigationBarLoading()
      Util.showMsg('设置日期成功')
      that.loadData()
    }).catch(function() {
      wx.hideNavigationBarLoading()
      Util.showMsg('设置日期失败')
    })
  },

  selectWallPaper: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      success: function(res) {
        var filePath = (res.tempFilePaths && res.tempFilePaths.length > 0) ? res.tempFilePaths[0] : null
        if (filePath) {
          wx.showNavigationBarLoading()
          var fileObj = new AV.File('WallPaperFile', {
            blob: {
              uri: filePath
            }
          })
          var obj = AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId)
          obj.set('wallPaper', fileObj)
          obj.save().then(function() {
            wx.hideNavigationBarLoading()
            Util.showMsg('设置图片成功')
            that.loadData()
          }).catch(function() {
            wx.hideNavigationBarLoading()
            Util.showMsg('设置图片失败')
          })
        } else {
          Util.showMsg('选图失败')
        }
      }
    })
  },

  loadData: function() {
    wx.showNavigationBarLoading()
    var that = this
    AV.Cloud.run('getWallPaperAndDays', {
      objId: getApp().globalData.userData.self.lovers.objectId
    }).then(function(res) {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      //更新View
      var cacheUrl = that.getCacheWallPaper()
      var dateSet = res.days || res.days == 0
      that.setData({
        wallPaperUrl: res.url ? res.url : cacheUrl,
        daysPrefix: dateSet ? '相随相伴' : '快点击设置你们的第一天吧',
        days: dateSet ? res.days : '',
        hasDays: dateSet
      })
      //缓存url
      if (res.url) {
        wx.setStorage({
          key: CACHE_WALLPAPER_KEY,
          data: res.url
        })
      }
    }).catch(function() {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      Util.showMsg('数据请求失败')
    })
  },

  getCacheWallPaper: function() {
    try {
      var cacheUrl = wx.getStorageSync(CACHE_WALLPAPER_KEY)
      return cacheUrl ? cacheUrl : DEFAULT_WALLPAPER
    } catch (e) {
      return DEFAULT_WALLPAPER
    }
  }
})