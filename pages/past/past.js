// pages/past/past.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    anniversary: {},
    dataList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.startPullDownRefresh()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading()
    var that = this
    AV.Cloud.run('getPastInfo', {
      loversId: getApp().globalData.userData.self.lovers.objectId,
    }).then(function(res) {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      //更新View
      that.setData({
        anniversary: res.anniversary,
        dataList: res.dataList
      })
    }).catch(function() {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      Util.showMsg('数据请求失败')
    })
  },
})