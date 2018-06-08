const Util = require('../../utils/util.js')

// pages/newUpdRecord/newUpdRecord.js
var txtDisAnimation = wx.createAnimation({
  transformOrigin: "50% 50%",
  duration: 400,
  timingFunction: "linear",
  delay: 0
}).rotateY(-180).opacity(0).step().export();
var emoAppAnimation = wx.createAnimation({
  transformOrigin: "50% 50%",
  duration: 400,
  timingFunction: "linear",
  delay: 0
}).rotateY(-180).opacity(1).step().export();
var txtAppAnimation = wx.createAnimation({
  transformOrigin: "50% 50%",
  duration: 400,
  timingFunction: "linear",
  delay: 0
}).rotateY(0).opacity(1).step().export();
var emoDisAnimation = wx.createAnimation({
  transformOrigin: "50% 50%",
  duration: 400,
  timingFunction: "linear",
  delay: 0
}).rotateY(0).opacity(0).step().export();
var emotionType = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    txtDisAnimation: txtDisAnimation,
    emoAppAnimation: emoAppAnimation,
    txtAppAnimation: txtAppAnimation,
    emoDisAnimation: emoDisAnimation,
    emotionType: null,
    selectedDate: null,
    place: null,
  },

  testAnimation: function (event) {
    emotionType = event.currentTarget.dataset.emotionType
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