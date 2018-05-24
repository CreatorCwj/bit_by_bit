// pages/record/record.js
const AV = require('../../libs/av-weapp-min.js')
var currentPageNo = 1

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperItems: [],
    listItems: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.startPullDownRefresh()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    currentPageNo = 1//reset pageNo
    wx.showNavigationBarLoading()
    var that = this
    var obj = AV.Object.createWithoutData('Lovers', AV.User.current().toJSON().lovers.objectId)
    AV.Cloud.run('getDataList', {
      objId: AV.User.current().toJSON().lovers.objectId,
      important: true,
      pageNo: currentPageNo
    }).then(function (res) {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      //更新View
      that.setData({
        swiperItems: res.importants,
        listItems: res.dataList
      })
    }).catch(function () {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      Util.showMsg('数据请求失败')
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    ++currentPageNo//add pageNo
    wx.showNavigationBarLoading()
    var that = this
    var obj = AV.Object.createWithoutData('Lovers', AV.User.current().toJSON().lovers.objectId)
    AV.Cloud.run('getDataList', {
      objId: AV.User.current().toJSON().lovers.objectId,
      important: false,
      pageNo: currentPageNo
    }).then(function (res) {
      wx.hideNavigationBarLoading()
      if (res && res.length > 0) {
        //更新View
        var newList = that.data.listItems.contact(res.dataList)
        that.setData({
          listItems: newList
        })
      } else {
        Util.showMsg('没有更多数据了！')
      }
    }).catch(function () {
      --currentPageNo//restore pageNo
      wx.hideNavigationBarLoading()
      Util.showMsg('数据请求失败')
    })
  }
})