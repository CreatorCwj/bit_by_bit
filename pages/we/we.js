// pages/we/we.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selfData: null,
    loverData: null,
  },

  updateData: function() {
    this.setData({
      selfData: getApp().globalData.userData.self,
      loverData: getApp().globalData.userData.lover,
    })
  },

  saveUserData: function(attrs) {
    wx.showLoading({
      title: '更新用户信息',
      mask: true,
    })
    AV.Object.createWithoutData('_User', getApp().globalData.userData.self.objectId)
      .set(attrs).save().then(function() {
        wx.hideLoading()
        //刷新用户信息
        wx.startPullDownRefresh()
      }).catch(function() {
        wx.hideLoading()
        Util.showMsg('更新用户信息失败')
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.updateData()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this
    wx.showNavigationBarLoading()
    //拉取用户和lover信息
    AV.Cloud.run('getUserData', {
      userId: getApp().globalData.userData.self.objectId,
    }).then(function(userData) {
      getApp().globalData.userData = userData
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      //更新数据、UI
      that.updateData()
    }).catch(function() {
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
      Util.showMsg('获取数据失败')
    })
  },

  customNameDone: function(event) {
    var that = this
    var customName = event.detail.value
    if (!customName) {
      customName = ''
    }
    wx.showModal({
      title: '提示',
      content: '更新昵称为 ' + customName + ' ?',
      success: function(res) {
        if (res.confirm) { //确定保存
          that.saveUserData({
            'customName': customName
          })
        } else { //恢复数据
          that.updateData()
        }
      }
    })
  },

  selectExtra: function(event) {
    var date = Util.getZeroDate(event.detail.value)
    if (!date) {
      return
    }
    switch (getApp().globalData.userData.self.gender) {
      case 1:
        this.saveUserData({
          'herMenstruation': date
        })
        break;
      case 2:
        this.saveUserData({
          'hisMakeLove': date
        })
        break;
    }
  },

  selectBirthday: function(event) {
    var that = this
    wx.showActionSheet({
      itemList: ['使用阳历生日', '使用阴历生日'],
      success(res) {
        //保存信息
        AV.Cloud.run('saveBirthday', {
          userId: getApp().globalData.userData.self.objectId,
          birthdayIsSolar: res.tapIndex == 0,
          solarBirthdayTime: Util.getZeroDate(event.detail.value).getTime(),
        }).then(function() {
          wx.hideLoading()
          //刷新用户信息
          wx.startPullDownRefresh()
        }).catch(function() {
          wx.hideLoading()
          Util.showMsg('更新用户信息失败')
        })
      }
    })
  },

})