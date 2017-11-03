// pages/createagenda/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: ['比赛', '活动'],  // , '训练'
    scaleList: ['3人制', '4人制', '5人制', '6人制', '7人制', '8人制', '9人制', '11人制'],
    currentNav: 0,
    translateX: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   wx.setNavigationBarTitle({
     title: '创建',
   });
  },

  /**
   * 切换tab
   */
  changeNav: function (e) {
    let index = e.target.dataset.index
    this.setData({
      'currentNav': index,
      'translateX': 100 * index
    })
  },

  /**
   * 确认创建
   */
  tapBottomButton: function (e) {
  }
})
