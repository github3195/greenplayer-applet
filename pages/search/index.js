// pages/search/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeType: 5,
    numberPerPage: 10,
    keyWord: '',
    searchList: [],
    searchType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      'searchType': options.searchType
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 输入框输入事件
   */
  searchInput: function (e) {
    let val = e.detail.value;
    this.setData({
      'keyWord': val
    });
  },

  /**
   * 点击搜索按钮
   */
  tapSearch: function () {
    if (!this.data.keyWord) {
      wx.showToast({
        title: '无效的关键字'
      });
      return;
    }
    let placeType = 'team' ==  this.data.searchType ? 2 : 5
    this.setData({
      placeType: placeType,
      numberPerPage: 10
    })
    this.searchAllInfoByCondition();
  },

  /**
   * 查询数据
   */
  searchAllInfoByCondition: function () {
    wx.showLoading({
      title: '正在查询',
    })
    let numberPerPage = 10;
    wx.api.post('searchAllInfoByCondition', {
      uid: wx.getStorageSync('uid') || 300,
      areaId: -1,
      condition: this.data.keyWord,
      placeType: this.data.placeType,
      lastId: '',
      numberPerPage: this.data.numberPerPage
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let searchList = [];
        searchList.push({
          index: 0,
          title: '相关赛事',
          placeType: 1,
          count: data.gameInfo.count,
          show: true,
          canLoadMore: data.gameInfo.gameList.length < data.gameInfo.count,
          list: data.gameInfo.gameList.map(item => {
            return {
              portrait: item.portrait,
              title: item.gamename,
              targetType: 2,
              targetId: item.gameid,
              gameStatus: item.statusCode,
              desc1: `${item.ruleName}制${2 == item.gametype ? '联赛' : 3 == item.gametype ? '杯赛' : ''} ${item.teamNumber || 0}支球队参赛`
            }
          })
        });
        searchList.push({
          index: 1,
          title: '相关球队',
          placeType: 2,
          count: data.teamInfo.count,
          show: true,
          canLoadMore: data.teamInfo.teamList.length < data.teamInfo.count,
          list: data.teamInfo.teamList.map(item => {
            return {
              portrait: item.portrait,
              title: item.teamname,
              targetType: 0,
              targetId: item.id,
              desc1: item.cityPlace
            }
          })
        });
        searchList.push({
          index: 2,
          title: '相关球员',
          placeType: 3,
          count: data.playerInfo.count,
          show: true,
          canLoadMore: data.playerInfo.playerList.length < data.playerInfo.count,
          list: data.playerInfo.playerList.map(item => {
            return {
              portrait: item.portrait,
              title: item.userName,
              targetType: 1,
              targetId: item.id,
              desc1: item.cityPlace
            }
          })
        });
        this.setData({
          'searchList': searchList
        })
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    })
  },

  /**
   * 加载更多
   */
  foldingLoadMore: function (e) {
    let placeType = e.target.dataset.placetype;
    let numberPerPage = this.data.numberPerPage + 10;
    this.setData({
      placeType: placeType,
      numberPerPage: numberPerPage
    });
    this.searchAllInfoByCondition();
  },

  /**
   * 显示隐藏折叠列表
   */
  foldingToggleShow: function (e) {
    let index = e.currentTarget.dataset.index;
    if (0 == index) {
      this.setData({
        'searchList[0].show': !this.data.searchList[0].show
      })
    } else if (1 == index) {
      this.setData({
        'searchList[1].show': !this.data.searchList[1].show
      })
    } else if (2 == index) {
      this.setData({
        'searchList[2].show': !this.data.searchList[2].show
      })
    }
  }
})