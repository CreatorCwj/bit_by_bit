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
    var query = new AV.Query('First');
    query.equalTo('lovers', AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId));
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
      content: ''
    })
  },

  addFirst: function() {
    this.setData({
      showAdd: true,
      selectDate: '',
      content: ''
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
    var record = new AV.Object('First')
    record.set('lovers', AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId))
    record.set('date', this.data.selectDate)
    record.set('content', this.data.content)
    var that = this
    record.save().then(function(res) {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      Util.showMsg('提交成功')
      that.setData({
        showAdd: false,
        selectDate: '',
        content: ''
      })
      //列表页需要刷新
      wx.startPullDownRefresh()
    }).catch(function(err) {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      Util.showMsg('提交失败')
    })
  }
})