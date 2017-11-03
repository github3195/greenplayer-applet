//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    portrait: '',
    name: '',
    signature: '',
    bgList: [
      'http://share.greenplayer.cn/share/img/player-cover.png'
    ],
    relList: [
      {
        icon: 'https://share.greenplayer.cn/share/img/playerData/xlqd.png',
        text: '球队',
        url: '../listpage/index?type=teamlist'
      }, {
        icon: 'https://share.greenplayer.cn/share/img/match/md.png',
        text: '日程',
        url: '../listpage/index?type=schedule'
      }, {
        icon: 'https://share.greenplayer.cn/share/img/match/competition.png',
        text: '赛事',
        url: '../listpage/index?type=gamelist'
      }
    ],
    activitiesList: ''
  },

  onLoad: function () {
    this.loadPlayerBasicInfoNew();
    this.showPersonalActivitiesAtCertainPeriod();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh () {
    this.loadPlayerBasicInfoNew();
    this.showPersonalActivitiesAtCertainPeriod();
  },

  /**
   * 设置首页的分享
   */
  onShareAppMessage: function () {
    return {
      title: `${this.data.name || ''}邀请您体验绿茵场,一站式足球赛事服务`,
      path: '/pages/index/index'
    }
  },

  /**
   * 登录了就跳转，未登录就跳去登录
   */
  goUrlIfLogined: function (e) {
    let url = wx.getStorageSync('uid') ? e.currentTarget.dataset.url : '../login/index';
    wx.navigateTo({
      url: url
    })
  },

  /**
   * 加载最近七天活动
   */
  showPersonalActivitiesAtCertainPeriod () {
    let uid = wx.getStorageSync('uid');
    if (!uid) {
      return;
    }
    let startDate = new Date();
    let endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    wx.api.post('showPersonalActivitiesAtCertainPeriod', {
      startDate: startDate,
      endDate: endDate,
      playerId: wx.getStorageSync('roleId'),
      uid: uid
    }, res => {
      if ('success' == res.data.status) {
        let list = [];
        let agenda = res.data.returndata.agenda
        for (let s in agenda) {
          let item = agenda[s];
          for (let id in item) {
            list.push({
              activityType: item[id].activityType,
              activityId: item[id].activityId,
              activityName: item[id].activityName,
              activityTime: item[id].activityTime.replace(/:\d+$/, '') || item[id].matchTime.replace(/:\d+$/, ''),
              matchId: item[id].associatedMatchId,
              matchTime: item[id].activityTime.replace(/:\d+$/, '') || item[id].matchTime.replace(/:\d+$/, ''),
              registerType: item[id].registerType,
              homeTeamId: item[id].selfTeamId,
              selfTeamId: item[id].selfTeamId,
              homeTeamName: item[id].selfTeamName,
              homeTeamPortrait: item[id].selfTeamPortrait,
              homeScore: item[id].curScoreA,
              homeUniform: {
                // image: item[id].homeUniform.coatImg,
                // coats: item[id].homeUniform.coatColor.replace('0x', '#'),
                // pants: item[id].homeUniform.pantsColor.replace('0x', '#'),
                // socks: item[id].homeUniform.socksColor.replace('0x', '#')
              },
              awayTeamId: item[id].opponentTeamId,
              awayTeamName: item[id].opponentTeamName,
              awayTeamPortrait: item[id].opponentTeamPortrait,
              awayScore: item[id].curScoreB,
              awayUniform: {
                // image: item[id].awayUniform.coatImg,
                // coats: item[id].awayUniform.coatColor.replace('0x', '#'),
                // pants: item[id].awayUniform.pantsColor.replace('0x', '#'),
                // socks: item[id].awayUniform.socksColor.replace('0x', '#')
              },
              courtName: item[id].courtName
            });
          }
        }
        this.setData({
          'activitiesList': list.sort((a, b) => {   // 按活动时间排序
            return new Date(a.activityTime) - new Date(b.activityTime)
          })
        });
      }
    })
  },

  /**
   * 加载球员个人资料
   */
  loadPlayerBasicInfoNew: function () {
    let uid = wx.getStorageSync('uid');
    let roleId = wx.getStorageSync('roleId');
    if (uid && roleId) {
      this.loadSliderBackgroundList();
      wx.showLoading({
        title: '正在加载'
      });
      wx.api.post('loadPlayerBasicInfoNew', {
        uid: wx.getStorageSync('uid'),
        targetPlayerId: wx.getStorageSync('roleId')
      }, res => {
        wx.hideLoading();
        if ('success' == res.data.status) {
          let data = res.data.returndata
          this.setData({
            'name': data.username,
            'portrait': data.portrait,
            'signature': data.signature
          });
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            showCancel: false
          })
        }
      })
    }
  },

  /**
   * 加载用户设置的背景图
   */
  loadSliderBackgroundList: function () {
    wx.api.post('baseApiEntry', {
      method: 'common_album_loadSliderBackgroundList',
      targetType: wx.getStorageSync('roleType'),
      targetId: wx.getStorageSync('roleId')
    }, res => {
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        if (data.length > 0) {
          let list = data.map(item => item.imgUrl);
          this.setData({
            'bgList': list
          });
        }
      } else {}
    })
  }
})
