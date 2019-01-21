// pages/newUpdRecord/newUpdRecord.js
const AV = require('../../libs/av-weapp-min.js')
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
    selectedDate: null,
    place: null,
    emotionType: null,
    content: null,
    imageUrls: null,
    isFirst: false,
    firstContent: null,
    isImportant: false,
    objectId: null,
  },

  onLoad: function(query) {
    if (!query.item) {
      wx.setNavigationBarTitle({
        title: '发布点滴'
      })
      return
    }
    wx.setNavigationBarTitle({
      title: '编辑点滴'
    })
    //编辑
    var item = JSON.parse(decodeURIComponent(query.item))
    this.setData({
      objectId: item.objectId,
      selectedDate: new Date(item.date),
      place: item.place,
      emotionType: item.emotion,
      content: item.content,
      isImportant: item.important,
      imageUrls: item.images
    })
  },

  //提交
  submit: function() {
    if (!this.data.selectedDate) {
      Util.showMsg('要选择日期哦~')
      return
    }
    if (!this.data.place || !this.data.place.trim()) {
      Util.showMsg('要填写地点哦~')
      return
    }
    if (!this.data.emotionType) {
      Util.showMsg('要选择心情哦~')
      return
    }
    if (!this.data.content || !this.data.content.trim()) {
      Util.showMsg('要填写内容哦~')
      return
    }
    if (this.data.isFirst && (!this.data.firstContent || !this.data.firstContent.trim())) {
      Util.showMsg('要填写第一次的标题哦~')
      return
    }
    //doSubmit
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '提交中',
      mask: true,
    })
    var record = this.data.objectId ? AV.Object.createWithoutData('Records', this.data.objectId) : new AV.Object('Records')
    record.set('publisher', AV.Object.createWithoutData('_User', getApp().globalData.userData.self.objectId))
    record.set('lovers', AV.Object.createWithoutData('Lovers', getApp().globalData.userData.self.lovers.objectId))
    record.set('date', this.data.selectedDate)
    record.set('place', this.data.place)
    record.set('emotion', this.data.emotionType)
    record.set('content', this.data.content)
    record.set('isFirst', this.data.isFirst)
    record.set('firstContent', this.data.firstContent)
    record.set('important', this.data.isImportant)
    var imageArr = (this.data.imageUrls && this.data.imageUrls.length > 0) ? this.data.imageUrls.map(function(model) {
      return model.objectId ? model : new AV.File('RecordImage', {
        blob: {
          uri: model.url
        }
      })
    }) : []
    record.set('images', imageArr)
    var that = this
    record.save().then(function(res) {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      Util.showMsg('提交成功')
      //列表页需要刷新
      getApp().globalData.refreshRecordList = true
      //跳转到详情页查看，携带过去item
      if (that.data.objectId) { //编辑页退回并刷新上一个详情页
        var pages = getCurrentPages()
        pages[pages.length - 2].setData({
          item: res.toJSON()
        })
        wx.navigateBack({
          delta: 1
        })
      } else { //新建页跳转到详情页并关闭自身
        wx.redirectTo({
          url: '/pages/recordDetail/recordDetail?item=' + encodeURIComponent(JSON.stringify(res))
        })
      }
    }).catch(function(err) {
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      Util.showMsg('提交失败')
    })
  },

  //重置
  reset: function() {
    this.setData({
      selectedDate: null,
      place: null,
      emotionType: null,
      content: null,
      imageUrls: null,
      isFirst: false,
      firstContent: null,
      isImportant: false,
    })
  },

  //添加图片
  addImage: function() {
    var that = this
    wx.chooseImage({
      count: 9,
      success: function(res) {
        if (res && res.tempFilePaths) {
          var urls = that.data.imageUrls ? that.data.imageUrls : []
          urls = urls.concat(res.tempFilePaths.map(function(item) {
            return {
              url: item
            }
          }))
          that.setData({
            imageUrls: urls
          })
        }
      }
    })
  },

  //删除图片
  deleteUrl: function(event) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '是否要删除图片?',
      success: function(res) {
        if (res.confirm) {
          var idx = event.currentTarget.dataset.imageUrlIndex
          var imageUrls = that.data.imageUrls
          imageUrls.splice(idx, 1)
          that.setData({
            imageUrls: imageUrls
          })
        }
      }
    })
  },

  //点击图片预览
  previewImage: function(event) {
    var imageUrls = this.data.imageUrls.map(function(item) {
      return item.url
    })
    wx.previewImage({
      current: event.currentTarget.dataset.imageUrl,
      urls: imageUrls
    })
  },

  //是否开启第一次
  changeFirst: function(event) {
    this.setData({
      isFirst: event.detail.value
    })
  },

  //第一次标题
  firstContentChange: function(event) {
    this.setData({
      firstContent: event.detail.value
    })
  },

  //是否为重要事件
  changeImportant: function(event) {
    this.setData({
      isImportant: event.detail.value
    })
  },

  //选择心情
  selectEmotion: function(event) {
    var emotionType = parseInt(event.currentTarget.dataset.emotionType)
    this.setData({
      emotionType: emotionType
    })
  },

  //选择日期
  selectDate: function(event) {
    var date = Util.getZeroDate(event.detail.value)
    this.setData({
      selectedDate: date,
    })
  },

  //输入地点
  placeChange: function(event) {
    this.setData({
      place: event.detail.value
    })
  },

  //输入内容
  contentChange: function(event) {
    this.setData({
      content: event.detail.value
    })
  }
})