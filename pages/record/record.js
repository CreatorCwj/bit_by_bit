// pages/record/record.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')
var currentPageNo = 1

Page({

  data: {
    swiperItems: [],
    listItems: []
  },

  onLoad: function(options) {
    wx.startPullDownRefresh()
  },

  onShow: function() {
    var needRefresh = getApp().globalData.refreshRecordList
    if (needRefresh) {
      getApp().globalData.refreshRecordList = false
      wx.startPullDownRefresh()
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    currentPageNo = 1 //reset pageNo
    wx.showNavigationBarLoading()
    var that = this
    AV.Cloud.run('getDataList', {
      objId: getApp().globalData.userData.self.lovers.objectId,
      important: true,
      pageNo: currentPageNo
    }).then(function(res) {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      //更新View
      that.setData({
        swiperItems: res.importants,
        listItems: res.dataList
      })
    }).catch(function() {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      Util.showMsg('数据请求失败')
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    ++currentPageNo //add pageNo
    wx.showNavigationBarLoading()
    var that = this
    AV.Cloud.run('getDataList', {
      objId: getApp().globalData.userData.self.lovers.objectId,
      important: false,
      pageNo: currentPageNo
    }).then(function(res) {
      wx.hideNavigationBarLoading()
      if (res.dataList && res.dataList.length > 0) {
        //更新View
        var newList = that.data.listItems.concat(res.dataList)
        that.setData({
          listItems: newList
        })
      } else {
        --currentPageNo //reset pageNo，下次再次加载本页看有没有数据
        Util.showMsg('没有更多数据了！')
      }
    }).catch(function() {
      --currentPageNo //reset pageNo
      wx.hideNavigationBarLoading()
      Util.showMsg('数据请求失败')
    })
  },

  addRecord: function() {
    wx.navigateTo({
      url: '/pages/newUpdRecord/newUpdRecord'
    })
  },

  onItemClick: function(event) {
    var item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/recordDetail/recordDetail?item=' + encodeURIComponent(JSON.stringify(item))
    })
  }
})