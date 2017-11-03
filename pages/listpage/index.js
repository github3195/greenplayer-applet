// pages/listpage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    uid: '',
    roleType: '',
    playerId: '',
    teamList: '',
    scheduleList: [],
    scheduleLoading: false,
    forwardPage: 0,
    backwardPage: 0,
    gameList: [
      {
        list: []
      },
      {
        list: []
      },
      {
        list: []
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uid = wx.getStorageSync('uid');
    let roleType = wx.getStorageSync('roleType');
    let playerId = wx.getStorageSync('roleId');
    this.setData({
      type: options.type,
      uid: uid,
      roleType: roleType,
      playerId: playerId
    });
    let title = '';
    if ('teamlist' == options.type) {
      title = '效力球队';
      this.handleTeamListPage()
    } else if ('schedule' == options.type) {
      title = '日程';
      this.handleScheduleList(1);
      this.handleScheduleList(2);
    } else if ('gamelist' == options.type) {
      title = '赛事';
      this.handleGameList();
    }
    wx.setNavigationBarTitle({
      title: title,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if ('teamlist' == this.data.type) {
      this.handleTeamListPage();
    }
  },

  /**
   * 效力球队数据
   */
  handleTeamListPage: function () {
    wx.api.post('loadAllTeamsOfPlayer', {
      uid: this.data.uid,
      playerId: this.data.playerId
    }, res => {
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let teamList = [];
        let teamArray = data.captain.concat(data.enrolled)
        teamArray.forEach(item => {
          teamList.push({
            teamId: item.teamid,
            portrait: item.portrait,
            teamName: item.teamname,
            credit: item.ActiveCredit,
            totalMemberNumber: item.totalMemberNumber,
            teamPassword: item.teamPassWord,
            associationName: item.associationList[0] ? item.associationList[0].associationName : '',
            registerCode: item.associationList[0] ? item.associationList[0].registerCode : '----',
            position: item.position[0] && 1 == item.position[0].pid ? '门将'
                    : item.position[0] && 2 == item.position[0].pid ? '后卫'
                    : item.position[0] && 3 == item.position[0].pid ? '中场'
                    : item.position[0] && 4 == item.position[0].pid ? '前锋' : '未设定',
            memberNumber: +item.memberNumber >= 0 ? item.memberNumber : 'N'
          })
        });
        this.setData({
          teamList: teamList
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    });
  },

  /**
   * 日程滚动到底部或顶部加载更多
   */
  scheduleLoadForward: function () {
    if (this.data.scheduleLoading) {
      return
    }
    this.handleScheduleList(2)
  },
  scheduleLoadBackward: function () {
    if (this.data.scheduleLoading) {
      return
    }
    this.handleScheduleList(1)
  },

  /**
   * 日程数据
   */
  handleScheduleList: function (type) {
    let startDate = new Date();
    let page = type == 2 ? this.data.forwardPage + 1 : type == 1 ? this.data.backwardPage + 1 : '';
    if (!page) {
      return
    }
    wx.showLoading({
      title: '正在加载',
    });
    this.setData({
      'scheduleLoading': true
    });
    wx.api.post('showActivitiesListOfPlayer', {
      dataType: 1,
      dateString: startDate,
      playerId: this.data.playerId,
      uid: this.data.uid,
      limit: 10,
      page: page,
      type: type
    }, res => {
      if ('success' == res.data.status) {
        let list = [];
        let agenda = res.data.returndata.agenda
        for (let s in agenda) {
          let item = agenda[s];
          for (let id in item) {
            if (item[id].activityType == 1 || item[id].activityType == 5) {
              list.push({
                activityType: item[id].activityType,
                activityId: item[id].activityId,
                activityName: item[id].activityName,
                activityTime: item[id].activityTime.replace(/:\d+$/, '') || item[id].matchTime.replace(/:\d+$/, ''),
                matchId: item[id].matchId,
                matchTime: item[id].activityTime.replace(/:\d+$/, '') || item[id].matchTime.replace(/:\d+$/, ''),
                registerType: item[id].registerType,
                homeTeamId: item[id].selfTeamId,
                homeTeamName: item[id].selfTeamName,
                homeTeamPortrait: item[id].selfTeamPortrait,
                homeScore: item[id].curScoreA,
                homeUniform: {
                  image: item[id].homeUniform.coatImg,
                  coats: item[id].homeUniform.coatColor.replace('0x', '#'),
                  pants: item[id].homeUniform.pantsColor.replace('0x', '#'),
                  socks: item[id].homeUniform.socksColor.replace('0x', '#')
                },
                awayTeamId: item[id].opponentTeamId,
                awayTeamName: item[id].opponentTeamName,
                awayTeamPortrait: item[id].opponentTeamPortrait,
                awayScore: item[id].curScoreB,
                awayUniform: {
                  image: item[id].awayUniform.coatImg,
                  coats: item[id].awayUniform.coatColor.replace('0x', '#'),
                  pants: item[id].awayUniform.pantsColor.replace('0x', '#'),
                  socks: item[id].awayUniform.socksColor.replace('0x', '#')
                },
                courtName: item[id].courtName
              });
            }
          }
        }
        wx.hideLoading();
        if (list.length < 1) {
          wx.showToast({
            title: '没有更多数据了'
          })
        }
        list = list.sort((a, b) => {   // 按活动时间排序
          return new Date(a.activityTime) - new Date(b.activityTime)
        });
        if (2 == type) {
          list = list.concat(this.data.scheduleList);
          this.setData({
            'forwardPage': ++this.data.forwardPage
          })
        } else if (1 == type) {
          list = this.data.scheduleList.concat(list);
          this.setData({
            'backwardPage': ++this.data.backwardPage
          })
        }
        this.setData({
          'scheduleList': list,
          'scheduleLoading': false
        });
      }
    })
  },

  /**
   * 赛事数据
   */
  handleGameList: function () {
    this.loadAllGamesEventParticipate(4, 1);
  },

  /**
   * 可折叠的列表加载更多数据
   */
  foldingLoadMore: function (e) {
    let pageId = e.target.dataset.page;
    let gamesType = e.target.dataset.gamestype;
    this.loadAllGamesEventParticipate(gamesType, pageId);
  },

  /**
   * 切换可折叠的列表显示隐藏
   */
  foldingToggleShow: function (e) {
    let index = e.currentTarget.dataset.index;
    if (0 == index) {
      this.setData({
        'gameList[0].show': !this.data.gameList[0].show
      })
    } else if (1 == index) {
      this.setData({
        'gameList[1].show': !this.data.gameList[1].show
      })
    } else if (2 == index) {
      this.setData({
        'gameList[2].show': !this.data.gameList[2].show
      })
    }
  },

  /**
   * 加载球员参加的赛事
   */
  loadAllGamesEventParticipate: function (gamesType, pageId) {
    wx.showLoading({
      title: '正在加载',
    });
    let numberPerPage = 5;
    wx.api.post('loadAllGamesEventParticipate', {
      uid: this.data.uid,
      targetType: this.data.roleType,
      targetId: this.data.playerId,
      gamesType: gamesType,
      pageId: pageId,
      numberPerPage: numberPerPage
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        if (data.attendGameList.length > 0) {   // 参加的赛事
          this.data.gameList[0].list = this.data.gameList[0].list.concat(data.attendGameList.map(item => {
            return {
              portrait: item.gamePortrait,
              title: item.gameName,
              targetType: 2,
              targetId: item.gameId,
              gameStatus: item.gameStatus,
              desc1: `${item.ruleName}制 ${2 == item.gameType ? '联赛' : 3 == item.gameType ? '杯赛' : ''}`
            }
          }));
        }
        if (data.concerGameList.length > 0) {   // 关注的赛事
          this.data.gameList[1].list = this.data.gameList[1].list.concat(data.concerGameList.map(item => {
            return {
              portrait: item.gamePortrait,
              title: item.gameName,
              targetType: 2,
              targetId: item.gameId,
              gameStatus: item.gameStatus,
              desc1: `${item.ruleName}制 ${2 == item.gameType ? '联赛' : 3 == item.gameType ? '杯赛' : ''}`
            }
          }));
        }
        if (data.sameGameList.length > 0) {   // 感兴趣的赛事
          this.data.gameList[2].list = this.data.gameList[2].list.concat(data.sameGameList.map(item => {
            return {
              portrait: item.gamePortrait,
              title: item.gameName,
              targetType: 2,
              targetId: item.gameId,
              gameStatus: item.gameStatus,
              desc1: `${item.ruleName}制 ${2 == item.gameType ? '联赛' : 3 == item.gameType ? '杯赛' : ''}`
            }
          }));
        }
        this.setData({
          'gameList': [{
            index: 0,
            title: '参加的赛事',
            gamesType: 1,
            pageId: gamesType == 1 ? ++this.data.gameList[0].pageId : 2,
            count: gamesType == 1 || gamesType == 4 ? data.attendCount : this.data.gameList[0].count,
            list: this.data.gameList[0].list,
            show: this.data.gameList[0].show == false ? false : true,
            canLoadMore: gamesType == 1 || gamesType == 4 ? !(data.attendGameList.length < numberPerPage) : this.data.gameList[0].canLoadMore
          },{
            index: 1,
            title: '关注的赛事',
            gamesType: 2,
            pageId: gamesType == 2 ? ++this.data.gameList[1].pageId : 2,
            count: gamesType == 2 || gamesType == 4 ? data.concerCount : this.data.gameList[1].count,
            list: this.data.gameList[1].list,
            show: this.data.gameList[1].show == false ? false : true,
            canLoadMore: gamesType == 2 || gamesType == 4 ? !(data.concerGameList.length < numberPerPage) : this.data.gameList[1].canLoadMore
          },{
            index: 2,
            title: '同城的赛事',
            gamesType: 3,
            pageId: gamesType == 3 ? ++this.data.gameList[2].pageId : 2,
            count: gamesType == 3 || gamesType == 4 ? data.sameCount : this.data.gameList[2].count,
            list: this.data.gameList[2].list,
            show: this.data.gameList[2].show == false ? false : true,
            canLoadMore: gamesType == 3 || gamesType == 4 ? !(data.sameGameList.length < numberPerPage) : this.data.gameList[2].canLoadMore
          }]
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    });
  }
})
