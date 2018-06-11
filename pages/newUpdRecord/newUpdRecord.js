// pages/newUpdRecord/newUpdRecord.js
const Util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    txtDisAnimation: wx.createAnimation().rotateY(-180).opacity(0).step().export(),
    txtAppAnimation: wx.createAnimation().rotateY(0).opacity(1).step().export(),
    emoAppAnimation: wx.createAnimation().rotateY(-180).opacity(1).step().export(),
    emoDisAnimation: wx.createAnimation().rotateY(0).opacity(0).step().export(),
    emotionType: null,
    selectedDate: null,
    place: null,
    isImportant: false,
    isFirst: false,
    firstTitle: null,
  },

  //是否开启第一次
  changeFirst: function (event) {
    this.setData({
      isFirst: event.detail.value
    })
  },

  //第一次标题
  firstTitleChange: function (event) {
    this.setData({
      firstTitle: event.detail.value
    })
  },

  //是否为重要事件
  changeImportant: function (event) {
    this.setData({
      isImportant: event.detail.value
    })
  },

  //选择心情
  selectEmotion: function (event) {
    var emotionType = event.currentTarget.dataset.emotionType
    this.setData({
      emotionType: emotionType
    })
  },

  //选择日期
  selectDate: function (event) {
    var date = Util.getZeroDate(event.detail.value)
    this.setData({
      selectedDate: date,
    })
  },

  //输入地点
  placeChange: function (event) {
    this.setData({
      place: event.detail.value
    })
  },

  //输入内容
  contentChange: function (event) {
    this.setData({
      content: event.detail.value
    })
  }
})