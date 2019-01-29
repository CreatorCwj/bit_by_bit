// pages/searchRecord/searchRecord.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')
var currentPageNo = 1

Page({

  data: {
    listItems: [],
    searchContent: '',
  },

  onLoad: function() {
    //reset
    getApp().globalData.refreshRecordSearch = false
  },

  onShow: function() {
    if (getApp().globalData.refreshRecordSearch && this.data.searchContent) {
      this.search()
    }
  },

  search: function() {
    currentPageNo = 1 //reset pageNo
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '搜索中',
      mask: true,
    })
    var that = this
    AV.Cloud.run('getDataList', {
      objId: getApp().globalData.userData.self.lovers.objectId,
      important: false,
      searchContent: this.data.searchContent,
      pageNo: currentPageNo
    }).then(function(res) {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      //更新View
      that.setData({
        listItems: res.dataList
      })
    }).catch(function() {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      Util.showMsg('数据请求失败')
    })
  },

  onSearchOk: function(event) {
    var content = event.detail.value
    if (!content || !content.trim()) {
      Util.showMsg('请输入正确的搜索内容')
      return
    }
    this.setData({
      searchContent: content,
    })
    this.search()
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
      searchContent: this.data.searchContent,
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

  onItemClick: function(event) {
    var item = event.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/recordDetail/recordDetail?item=' + encodeURIComponent(JSON.stringify(item))
    })
  }
})