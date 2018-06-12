// pages/login/login.js
const AV = require('../../libs/av-weapp-min.js')
const Util = require('../../utils/util.js')
const TextMessage = require('../../libs/realtime.weapp.min.js').TextMessage
const realTime = getApp().globalData.realtime
const USER_INFO_SCOPE = 'scope.userInfo'
const SHARE_ID_KEY = 'requesterId'
const SHARE_NAME_KEY = 'requesterNickName'
var imClient = null
var query = null

Page({

  data: {
    nickName: '对象',
    avatarUrl: '../../resources/images/logo.png',
    disabled: true,
    showModal: false
  },

  onUnload: function () {
    this.closeClient()
  },

  closeClient: function () {
    if (imClient) {
      imClient.close()
    }
  },

  onLoad: function (shareQuery) {
    query = shareQuery
    wx.hideShareMenu()
    var that = this
    wx.showLoading({
      title: '登录中',
      mask: true,
    })
    //登录云端
    AV.User.loginWithWeapp().then(user => {
      wx.hideLoading()
      wx.getSetting({//获取权限配置
        success: res => {
          if (res.authSetting[USER_INFO_SCOPE]) {//已经授予权限则直接获取UserInfo
            that.fetchUserInfo()
          } else {
            wx.authorize({//请求权限
              scope: USER_INFO_SCOPE,
              success: () => {//请求成功直接获取UserInfo
                that.fetchUserInfo()
              },
              fail: () => {
                //展示授权窗口
                that.setData({
                  showModal: true
                })
                //以下授权流程失效，需要使用button引导用户手动授权
                //对话框提示打开设置页设置权限
                // wx.showModal({
                //   title: '提示',
                //   content: '用户信息权限为必要权限，否则小程序无法正常使用，请前往设置',
                //   showCancel: false,
                //   confirmText: '设置',
                //   success: res => {
                //     if (res.confirm) {
                //       wx.openSetting({//打开设置页
                //         success: res => {
                //           if (res.authSetting[USER_INFO_SCOPE]) {//授予后请求UserInfo
                //             that.fetchUserInfo()
                //           } else {//否则提示用户手动打开
                //             Util.showMsg('请授予用户信息权限后重试，否则无法使用\n路径：右上角->关于->右上角->设置')
                //           }
                //         }
                //       })
                //     }
                //   }
                // })
              }
            })
          }
        }
      })
    }, () => {
      wx.hideLoading()
      Util.showMsg('登录失败，请退出重新尝试')
    });
  },

  openAuth: function () {
    //点击授权窗口后关闭窗口
    this.setData({
      showModal: false
    })
  },

  getUserInfo: function (e) {
    if (e.detail.userInfo) {//授权成功
      this.fetchUserInfo()
    } else {
      //展示授权窗口
      this.setData({
        showModal: true
      })
    }
  },

  fetchUserInfo: function () {
    wx.showLoading({
      title: '获取用户信息',
      mask: true,
    })
    var that = this
    //获取UserInfo
    wx.getUserInfo({
      withCredentials: false,
      success: ({ userInfo }) => {
        //更新云端当前用户的信息
        AV.User.current().set(userInfo).save().then(user => {
          wx.hideLoading()
          //更新成功，执行后续逻辑
          that.loginSuccess()
        }, () => {
          wx.hideLoading()
          Util.showMsg('更新用户信息失败，请退出重新尝试')
        })
      },
      fail: () => {
        wx.hideLoading()
        Util.showMsg('获取用户信息失败，请退出重新尝试')
      }
    });
  },

  loginSuccess: function () {
    var that = this
    var user = AV.User.current().toJSON()
    //刷新UI
    that.setData({
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      disabled: user.lovers ? true : false,
    })
    if (user.lovers) {//跳转到主页面
      that.jumpToMain()
    } else if (query && query[SHARE_ID_KEY]) {//点击分享进入，有追求者，处理追求请求
      that.findLover(query)
    } else {//提示去寻找另一半
      wx.showModal({
        title: '寻求你的Ta',
        content: '快去转发给你的Ta，一起绑定吧！',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },

  //处理追求请求
  findLover: function () {
    var that = this
    wx.showModal({
      title: '绑定你的Ta',
      content: query[SHARE_NAME_KEY] + ' 请求与你绑定，是否同意？',
      showCancel: true,
      cancelText: '拒绝',
      confirmText: '同意',
      success: res => {
        if (res.confirm) {//同意
          wx.showLoading({
            title: '绑定中',
            mask: true,
          })
          var user = AV.User.current()
          //云端创建Lovers关系并绑定至User
          var LoversClass = AV.Object.extend('Lovers')
          var newLovers = new LoversClass()
          newLovers.set('lover1', user)
          newLovers.set('lover2', AV.Object.createWithoutData('_User', query[SHARE_ID_KEY]))
          newLovers.save().then(function () {
            wx.hideLoading()
            Util.showMsg('绑定成功')
            //通知追求者
            realTime.createIMClient(user.id).then(function (me) {
              imClient = me
              return me.createConversation({
                members: [query[SHARE_ID_KEY]],
                name: 'message',
              });
            }).then(function (conversation) {
              // 发送消息
              return conversation.send(new TextMessage('ok'));
            }).then(function (message) {
              that.closeClient()
              console.log('发送消息成功');
            }).catch(function () {
              that.closeClient()
              console.log('发送消息失败');
            })
            //刷新用户信息跳转到主页面
            that.updUserAndJump()
          }).catch(function () {
            wx.hideLoading()
            Util.showMsg('绑定失败，请重新绑定！')
          })
        }
      }
    })
  },

  //转发寻找lover
  onShareAppMessage: function (options) {
    var that = this
    if (options.from === 'button') {
      var user = AV.User.current().toJSON()
      return {
        title: '我们的点点滴滴',
        path: '/pages/login/login?' + SHARE_ID_KEY + '=' + user.objectId + '&' + SHARE_NAME_KEY + '=' + user.nickName,
        success: () => {
          Util.showMsg('转发成功，等待对方同意吧！')
          //开启实时通信等待回复
          realTime.createIMClient(user.objectId).then(function (me) {
            imClient = me
            me.on('message', function (message, conversation) {
              if (message && message.text == 'ok') {//绑定成功，刷新用户信息跳转到主页面
                that.closeClient()
                that.updUserAndJump()
              }
            })
          })
        }
      }
    }
  },

  //更新用户信息并跳转主页
  updUserAndJump: function () {
    wx.showLoading({
      title: '更新用户信息',
      mask: true,
    })
    var that = this
    AV.User.current().fetch().then(function () {
      wx.hideLoading()
      that.jumpToMain()
    }).catch(function () {
      wx.hideLoading()
      Util.showMsg('更新用户信息失败，请退出重试')
    })
  },

  jumpToMain: function () {
    wx.reLaunch({
      url: '/pages/time/time'
    })
  }
})