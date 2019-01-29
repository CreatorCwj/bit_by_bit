// pages/recordDetail/recordDetail.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item: null,
  },

  onLoad: function(query) {
    var item = JSON.parse(decodeURIComponent(query.item))
    this.setData({
      item: item,
    })
  },

  //点击图片预览
  previewImage: function(event) {
    var imageUrls = this.data.item.images.map(function(item) {
      return item.url
    })
    wx.previewImage({
      current: event.currentTarget.dataset.imageUrl,
      urls: imageUrls
    })
  },

  onDelete: function() {
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否要删除记录?',
      success: function(res) {
        if (res.confirm) {
          wx.showNavigationBarLoading()
          wx.showLoading({
            title: '删除中',
            mask: true,
          })
          var record = AV.Object.createWithoutData('Records', that.data.item.objectId);
          record.destroy().then(function() {
            wx.hideNavigationBarLoading()
            wx.hideLoading()
            Util.showMsg('删除成功')
            //返回上一页刷新
            getApp().globalData.refreshRecordList = true
            //搜索页需要刷新
            getApp().globalData.refreshRecordSearch = true
            wx.navigateBack({
              delta: 1
            })
          }).catch(function() {
            wx.hideNavigationBarLoading()
            wx.hideLoading()
            Util.showMsg('删除失败')
          })
        }
      }
    })
  },

  onEdit: function() {
    var item = this.data.item
    wx.navigateTo({
      url: '/pages/newUpdRecord/newUpdRecord?item=' + encodeURIComponent(JSON.stringify(item))
    })
  },
})