// pages/find/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navList: ['赛事', '比赛', '球队', '球员'],
    curNav: 0,
    translateX: 0,
    numberPerPage: 20,
    loadingMore: false,
    gameList: [],
    gameLoadPage: 1,
    matchList: [],
    matchPageBefore: 0,
    matchPageFeature: 1,
    teamList: [],
    teamLoadPage: 1,
    playerList: [],
    playerLoadPage: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '发现',
    });
    this.loadMyGameHomepage();
  },

  /**
   * 切换tab
   */
  changeNav: function (e) {
    let index = e.target.dataset.index
    this.setData({
      'curNav': index,
      'translateX': 100 * index
    });
    if (0 == index && this.data.gameList.length < 1) {
      this.loadMyGameHomepage();
    }
    if (1 == index && this.data.matchList.length < 1) {
      this.loadAllMatchesHomepage(1);
    }
    if (2 == index && this.data.teamList.length < 1) {
      this.loadAllTeamsByRank();
    }
    if (3 == index && this.data.playerList.length < 1) {
      this.loadAllPlayersInfo();
    }
  },

  /**
   * 加载发现赛事列表
   */
  loadMyGameHomepage: function () {
    wx.showLoading({
      title: '正在加载',
    });
    wx.api.post('loadMyGameHomepage', {
      uid: wx.getStorageSync('uid') || 300,
      daysAdvance: "30",
      scope: "0",
      page: this.data.gameLoadPage,
      numberPerPage: this.data.numberPerPage,
      filter: ""
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let gameList = data.map(item => {
          return {
            targetType: 2,
            targetId: item.gameid,
            title: item.gamename,
            portrait: item.portrait,
            gameStatus: item.statusCode,
            desc1: `${item.place} ${2 == item.gameType ? '联赛' : 3 == item.gameType ? '杯赛' : ''} ${item.teamNumber}支球队参赛`,
            gameType: item.gameType,
            area: item.place,
            teamNmuber: item.teamNumber,
            isAward: item.isAward
          }
        });
        this.setData({
          'gameList': this.data.gameList.concat(gameList),
          'loadingMore': false
        });
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    });
  },
  // 加载更多赛事
  loadMoreGame: function () {
    if (this.data.loadingMore) {
      return
    }
    this.setData({
      'loadingMore': true,
      'gameLoadPage': ++this.data.gameLoadPage
    });
    this.loadMyGameHomepage();
  },

  /**
   * 加载发现比赛列表
   */
  loadAllMatchesHomepage: function (scoped) {
    let page = 1 == scoped ? this.data.matchPageFeature : 2 == scoped ? this.data.matchPageBefore : '';
    if (!page) {
      return
    }
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('loadAllMatchesHomepage', {
      uid: wx.getStorageSync('uid') || 300,
      scope: scoped,
      $areaId: -1,
      page: page,
      numberPerPage: this.data.numberPerPage
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let matchList = data.map(item => {
          return {
            matchId: item.matchId,
            matchTime: item.matchTime.replace(/:\d+$/, ''),
            homeTeamId: item.party_a_uid,
            homeTeamName: item.a_name,
            homeTeamPortrait: item.a_icon,
            homeScore: item.score_a,
            awayTeamId: item.party_b_uid,
            awayTeamName: item.b_name,
            awayTeamPortrait: item.b_icon,
            awayScore: item.score_b,
            courtName: item.courtName
          }
        });
        2 == scoped && matchList.reverse();
        matchList = 1 == scoped ? this.data.matchList.concat(matchList)
                  : 2 == scoped ? matchList.concat(this.data.matchList)
                  : matchList;
        this.setData({
          'matchList': matchList,
          'loadingMore': false
        })
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    });
  },
  // 加载已结束的比赛
  loadBeforeMatch: function () {
    if (this.data.loadingMore) {
      return
    }
    this.setData({
      'loadingMore': true,
      'matchPageBefore': ++this.data.matchPageBefore
    })
    this.loadAllMatchesHomepage(2);
  },
  // 加载正要进行的比赛
  loadFeatureMatch: function () {
    if (this.data.loadingMore) {
      return
    }
    this.setData({
      'loadingMore': true,
      'matchPageFeature': ++this.data.matchPageFeature
    })
    this.loadAllMatchesHomepage(1);
  },

  /**
   * 加载发现的球队列表
   */
  loadAllTeamsByRank: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('loadAllTeamsByRank', {
      uid: wx.getStorageSync('uid') || 300,
      areaId: -1,
      daysAdvance: "0",
      pageId: this.data.teamLoadPage,
      numberPerPage: this.data.numberPerPage
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let teamList = data.map((item, index) => {
          return {
            targetType: 0,
            targetId: item.id,
            col1: (this.data.teamLoadPage - 1) * this.data.numberPerPage + ++index,
            name: item.teamname,
            portrait: item.portrait,
            col3: item.success,
            col4: item.even,
            col5: item.lose,
            col6: `${item.totalScore}/${item.totalLost}`,
            col7: item.Credit
          }
        });
        this.setData({
          'teamList': this.data.teamList.concat(teamList),
          'loadingMore': false
        })
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    })
  },
  // 加载更多球队
  loadMoreTeam: function () {
    if (this.data.loadingMore) {
      return
    }
    this.setData({
      'loadingMore': true,
      'teamLoadPage': ++this.data.teamLoadPage
    });
    this.loadAllTeamsByRank();
  },

  /**
   * 加载发现球员列表
   */
  loadAllPlayersInfo: function () {
    wx.showLoading({
      title: '正在加载',
    });
    wx.api.post('loadAllPlayersInfo', {
      uid: wx.getStorageSync('uid') || 300,
      areaId: -1,
      daysAdvance: "0",
      pageId: this.data.playerLoadPage,
      numberPerPage: this.data.numberPerPage
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let playerList = data.map((item, index) => {
          return {
            targetType: 1,
            targetId: item.id,
            col1: (this.data.playerLoadPage - 1) * this.data.numberPerPage + ++index,
            name: item.nickname,
            portrait: item.portrait,
            col3: item.totalMatches,
            col4: item.scoreNumber,
            col5: item.assistNumber,
            col6: item.SkillCredit
          }
        });
        this.setData({
          'playerList': this.data.playerList.concat(playerList),
          'loadingMore': false
        })
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    })
  },
  // 加载更多球员
  loadMorePlayer: function () {
    if (this.data.loadingMore) {
      return
    }
    this.setData({
      'loadingMore': true,
      'playerLoadPage': ++this.data.playerLoadPage
    });
    this.loadAllPlayersInfo();
  }
})