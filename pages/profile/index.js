// pages/profile/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userProfile: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '资料',
    });
    this.loadPlayerBasicInfoNew();
  },

  /**
   * 加载球员个人资料
   */
  loadPlayerBasicInfoNew: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('loadPlayerBasicInfoNew', {
      uid: wx.getStorageSync('uid'),
      targetPlayerId: wx.getStorageSync('roleId')
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        this.setData({
          'userProfile': res.data.returndata
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    })
  },

  /**
   * 点击退出登录
   */
  tapLogout: function (e) {
    wx.showLoading({
      title: '正在注销',
    });
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('playerInfo');
    wx.removeStorageSync('uid');
    wx.removeStorageSync('token');
    wx.removeStorageSync('roleId');
    wx.removeStorageSync('roleType');
    wx.hideLoading();
    let pages = getCurrentPages();
    pages[pages.length - 2].setData({
      portrait: '',
      name: '',
      signature: '',
      activitiesList: ''
    });
    wx.redirectTo({
      url: '../login/index',
    });
  }
})