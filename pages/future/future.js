// pages/future/future.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')

const DOING = {
  status: 0,
  text: '进行中'
}
const UNDO = {
  status: 1,
  text: '未完成'
}
const DONE = {
  status: 2,
  text: '已完成'
}

const planFloatAnimation = wx.createAnimation()
  .left('277.5rpx').width('195rpx').step({
    duration: 100,
  }).left('155rpx').width('65rpx').step({
    duration: 100,
  }).export()
const hisFloatAnimation = wx.createAnimation()
  .left('277.5rpx').width('195rpx').step({
    duration: 100,
  }).left('530rpx').width('65rpx').step({
    duration: 100,
  }).export()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlan: true,
    dataList: [],
    floatAnimation: null,
    showAdd: false,
    selectDate: '',
    content: '',
    editObj: null,
    addDisAnimation: wx.createAnimation({
      duration: 400,
    }).rotateZ(180).left('760rpx').opacity(0).step().export(),
    addAppAnimation: wx.createAnimation({
      duration: 400,
    }).rotateZ(0).left('598rpx').opacity(1).step().export(),
  },

  onTabItemClick: function(event) {
    var isPlan = event.currentTarget.dataset.isPlan == 'true'
    if (this.data.isPlan != isPlan) {
      var floatAnimation = isPlan ? planFloatAnimation : hisFloatAnimation
      this.setData({
        isPlan: isPlan,
        floatAnimation: floatAnimation,
      })
    }
  },

  addFuture: function() {
    this.setData({
      showAdd: true,
      selectDate: '',
      content: '',
      editObj: null,
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

  onItemClick: function(event) {
    var item = event.currentTarget.dataset.item
    if (!item) return
    var that = this
    wx.showActionSheet({
      itemList: (item.status == DOING.status) ? ['已完成', '未完成', '编辑', '删除'] : ['已完成', '未完成', '删除'],
      success(res) {
        switch (res.tapIndex) {
          case 0:
            that.updStatus(item, DONE)
            break;
          case 1:
            that.updStatus(item, UNDO)
            break;
          case 2:
            (item.status == DOING.status) ? that.editFuture(item): that.deleteFuture(item)
            break;
          case 3:
            that.deleteFuture(item)
            break;
        }
      }
    })
  },

  deleteFuture: function(item) {
    wx.showModal({
      title: '提示',
      content: '是否要删除计划?',
      success: function(res) {
        if (res.confirm) {
          wx.showNavigationBarLoading()
          wx.showLoading({
            title: '删除中',
            mask: true,
          })
          var future = AV.Object.createWithoutData('Future', item.objectId);
          future.destroy().then(function() {
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

  editFuture: function(item) {
    this.setData({
      showAdd: true,
      selectDate: new Date(item.date),
      content: item.content,
      editObj: item,
    })
  },

  updStatus: function(item, statusObj) {
    wx.showModal({
      title: '提示',
      content: '是否要将该计划状态修改为 ' + statusObj.text + ' ?',
      success: function(res) {
        if (res.confirm) {
          wx.showNavigationBarLoading()
          wx.showLoading({
            title: '修改中',
            mask: true,
          })
          var future = AV.Object.createWithoutData('Future', item.objectId);
          future.set('status', statusObj.status)
          future.save().then(function() {
            wx.hideNavigationBarLoading()
            wx.hideLoading()
            Util.showMsg('修改成功')
            //列表页需要刷新
            wx.startPullDownRefresh()
          }).catch(function() {
            wx.hideNavigationBarLoading()
            wx.hideLoading()
            Util.showMsg('修改失败')
          })
        }
      }
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
    var future = this.data.editObj ? AV.Object.createWithoutData('Future', this.data.editObj.objectId) : new AV.Object('Future')
    future.set('lovers', AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId))
    future.set('date', this.data.selectDate)
    future.set('content', this.data.content)
    var that = this
    future.save().then(function() {
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
    var query = new AV.Query('Future')
    query.equalTo('lovers', AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId))
    query.addAscending('date')
    query.addAscending('createdAt')
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
})