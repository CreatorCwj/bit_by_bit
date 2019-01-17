// pages/first/first.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    showAdd: false,
    selectDate: '',
    content: '',
    editObj: null,
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
    var query = new AV.Query('First')
    query.equalTo('lovers', AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId))
    query.addAscending('date')
    query.addDescending('createdAt')
    query.find().then(function(res) {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      //更新View
      that.setData({
        dataList: res
      })
    }).catch(function() {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      Util.showMsg('数据请求失败')
    })
  },

  onCancelClick: function() {
    this.setData({
      showAdd: false,
      selectDate: '',
      content: '',
      editObj: null,
    })
  },

  addFirst: function() {
    this.setData({
      showAdd: true,
      selectDate: '',
      content: '',
      editObj: null,
    })
  },

  onDateSelect: function(event) {
    var date = Util.getZeroDate(event.detail.value)
    this.setData({
      selectDate: date,
    })
  },

  onContentChange: function(event) {
    this.setData({
      content: event.detail.value
    })
  },

  submit: function() {
    if (!this.data.selectDate) {
      Util.showMsg('要选择日期哦~')
      return
    }
    if (!this.data.content) {
      Util.showMsg('要填写内容哦~')
      return
    }
    //doSubmit
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '提交中',
      mask: true,
    })
    var first = this.data.editObj ? AV.Object.createWithoutData('First', this.data.editObj.objectId) : new AV.Object('First')
    first.set('lovers', AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId))
    first.set('date', this.data.selectDate)
    first.set('content', this.data.content)
    var that = this
    first.save().then(function() {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      Util.showMsg('提交成功')
      that.setData({
        showAdd: false,
        selectDate: '',
        content: '',
        editObj: null,
      })
      //列表页需要刷新
      wx.startPullDownRefresh()
    }).catch(function() {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      Util.showMsg('提交失败')
    })
  },

  onItemClick: function(event) {
    var item = event.currentTarget.dataset.item
    if (!item) {
      return
    }
    var that = this
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success(res) {
        switch (res.tapIndex) {
          case 0:
            that.editFirst(item)
            break;
          case 1:
            that.deleteFirst(item.objectId)
            break;
        }
      }
    })
  },

  deleteFirst: function(objId) {
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
          var first = AV.Object.createWithoutData('First', objId);
          first.destroy().then(function() {
            wx.hideNavigationBarLoading()
            wx.hideLoading()
            Util.showMsg('删除成功')
            //列表页需要刷新
            wx.startPullDownRefresh()
          }).catch(function() {
            wx.hideNavigationBarLoading()
            wx.hideLoading()
            Util.showMsg('删除失败')
          })
        }
      }
    })
  },

  editFirst: function(item) {
    this.setData({
      showAdd: true,
      selectDate: new Date(item.date),
      content: item.content,
      editObj: item,
    })
  },
})