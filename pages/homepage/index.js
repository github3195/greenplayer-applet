// pages/homepage/index.js

const utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: wx.getStorageSync('uid') || '300',
    targetType: '',
    targetId: '',
    showPageFoot: false,         // 显示底部工具条，加入球队、退出球队等
    navList: ['资料', '动态'],
    currentNav: 0,
    translateX: 0,
    numberPerPage: 20,
    scrollY: false,
    sliderBackgroundList: [],
    details: {},
    memberList: [],      // 赛事名单，球队成员列表
    teamList: [],
    matchHistoryList: [],
    loadingMore: false,
    loadingPage: 1,
    dataNavList: [
      {
        text: '赛程',
        index: 0
      }, {
        text: '积分榜',
        index: 1
      }, {
        text: '射手榜',
        index: 2
      }, {
        text: '助攻榜',
        index: 3
      }, {
        text: '纪律',
        index: 4
      }],
    currentDataNav: 0,
    gameData: {
      currentTurn: '',
      scheduleList: [],
      scoreList: [],
      shooterList: [],
      assistsList: [],
      punishList: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let title = '';
    // 0:球队; 1:球员; 2:比赛; 3:裁判; 4:协会; 5:教练; 6:俱乐部; 7:球迷会
    if (0 == options.targetType) {
      title = '球队主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '成员', '战绩', '动态'],
        showPageFoot: true
      });
      this.loadSliderBackgroundList(2, options.targetId);
      this.teamBasicInfo();
      this.getTeamDataInfo();
    } else if (1 == options.targetType) {
      title = '球员主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '球队', '战绩', '动态']
      });
      this.loadSliderBackgroundList(1, options.targetId);
      this.loadPlayerBasicInfoNew();
      this.loadAllTeamsOfPlayer();
      this.loadPlayerMatchHistory();
    } else if (2 == options.targetType) {
      title = '赛事主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '名单', '数据', '动态']
      });
      this.gameBasicInfo();
      this.loadSetupGameScheduleCompletely();
    } else if (3 == options.targetType) {
      title = '裁判主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '成员', '战绩', '动态']
      });
    } else if (4 == options.targetType) {
      title = '协会主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '赛事', '球队', '动态']
      });
    } else if (5 == options.targetType) {
      title = '教练主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '球队', '战绩', '动态']
      });
    } else if (6 == options.targetType) {
      title = '俱乐部主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '成员', '战绩', '动态']
      });
    } else if (7 == options.targetType) {
      title = '球迷会主页';
      this.setData({
        targetType: options.targetType,
        targetId: options.targetId,
        navList: ['资料', '成员', '战绩', '动态']
      });
    }
    wx.setNavigationBarTitle({
      title: title,
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.details.name,
      path: `/pages/homepage/index?targetType=${this.data.targetType}&targetId=${this.data.targetId}`
    }
  },

  /**
   * 切换tab
   */
  changeNav: function (e) {
    let index = e.target.dataset.index
    this.setData({
      'currentNav': index,
      'translateX': 100 * index
    });
  },

  /**
   * 切换赛事数据tab
   */
  changeDataNav: function (e) {
    let index = e.target.dataset.index
    this.setData({
      'currentDataNav': index
    });
    if (0 == index && this.data.gameData.scheduleList.length < 1) {
      this.loadSetupGameScheduleCompletely()
    } else if (1 == index && this.data.gameData.scoreList.length < 1) {
      this.getGroupMatchRank();
    } else if (2 == index && this.data.gameData.shooterList.length < 1) {
      this.loadGameScoreRankList(1);
    } else if (3 == index && this.data.gameData.assistsList.length < 1) {
      this.loadGameScoreRankList(3);
    } else if (4 == index && this.data.gameData.punishList.length < 1) {
      this.loadGamePunishRankList();
    }
  },

  /**
   * 滚动的时候判断container下的scroll-view是否可滚动
   */
  pageScroll: function (e) {
    let scrollTop = e.detail.scrollTop;
    this.setData({
      'scrollY': scrollTop > 200
    })
  },

  /**
   * 加载主页背景轮播图
   */
  loadSliderBackgroundList: function (targetType, targetId) {
    wx.api.post('baseApiEntry', {
      method: 'common_album_loadSliderBackgroundList',
      targetType: targetType,
      targetId: targetId
    }, res => {
      if ('success' == res.data.status) {
        if (res.data.returndata.length > 0) {
          this.setData({
            sliderBackgroundList: res.data.returndata.map(item => item.imgUrl)
          });
        } else {
          let defaultSlider = [];
          if (0 == this.data.targetType) {
            defaultSlider.push('https://share.greenplayer.cn/share/img/team-cover.jpg');
          }
          if (1 == this.data.targetType) {
            defaultSlider.push('https://share.greenplayer.cn/share/img/player-cover.png');
          }
          this.setData({
            sliderBackgroundList: defaultSlider
          });
        }
      }
    })
  },

  /**
   * 加载球队基本信息
   */
  teamBasicInfo: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('teamBasicInfo', {
      uid: this.data.uid,
      teamId: this.data.targetId
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        this.setData({
          'details': {
            name: data.teamname,
            portrait: data.portrait,
            signature: data.signature,
            inTeam: data.inteam,
            foundingTime: data.createTime ? utils.shortDate(data.createTime) : '未知',
            area: data.area || '未知',
            homeCourt: data.courtAddress || '未知',
            homeUniform: data.homeCoatColor || ' ',
            combat: data.combat,
            intro: data.teamIntro || ' '
          },
          'memberList': [{
            title: '管理员',
            list: data.administrators.map(item => {
              return {
                targetType: 1,
                targetId: item.id,
                name: item.userName,
                portrait: item.portrait
              }
            })
          }, {
            title: '教练',
            list: data.coachList.map(item => {
              return {
                targetType: 1,
                targetId: item.coachId,
                name: item.coachName,
                portrait: item.portrait
              }
            })
          }, {
            title: '领队',
            list: data.leaderList.map(item => {
              return {
                targetType: 1,
                targetId: item.userid,
                name: item.userName,
                portrait: item.portrait
              }
            })
          }, {
            title: '球员',
            show: true,
            list: data.playerList.map(item => {
              return {
                targetType: 1,
                targetId: item.userid,
                name: item.userName,
                portrait: item.portrait,
                desc: `${item.memberNumber>=0?item.memberNumber:'N'}号`
              }
            })
          }]
        });
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
   * 加载球队战绩
   */
  getTeamDataInfo: function () {
    wx.showLoading({
      title: '正在加载'
    })
    wx.api.post('baseApiEntry', {
      method: 'team_match_getTeamDataInfo',
      uid: this.data.uid,
      page: this.data.loadingPage,
      numberPage: "20",
      teamId: this.data.targetId
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata.matchData;
        let matchList = data.map(item => {
          return {
            matchId: item.id,
            matchTime: item.matchTime ? item.matchTime.replace(/:\d+$/, '') : '未知',
            homeTeamId: item.teamIdA,
            homeTeamName: item.teamNameA,
            homeTeamPortrait: item.portraitA,
            homeScore: item.scoreA,
            awayTeamId: item.teamIdB,
            awayTeamName: item.teamNameB,
            awayTeamPortrait: item.portraitB,
            awayScore: item.scoreB,
            courtName: item.courtName,
            gameResult: item.gameResult,
            homeUniform: {
              coats: item.homeUniform.coatColor?item.homeUniform.coatColor.replace('0x', '#'):'',
              pants: item.homeUniform.pantsColor?item.homeUniform.pantsColor.replace('0x', '#'):'',
              socks: item.homeUniform.socksColor?item.homeUniform.socksColor.replace('0x', '#'):''
            },
            awayUniform: {
              coats: item.awayUniform.coatColor?item.awayUniform.coatColor.replace('0x', '#'):'',
              pants: item.awayUniform.pantsColor?item.awayUniform.pantsColor.replace('0x', '#'):'',
              socks: item.awayUniform.socksColor?item.awayUniform.socksColor.replace('0x', '#'):''
            }
          }
        }); 
        if (matchList.length < 1) {
          wx.showToast({
            title: '已全部加载'
          });
          return
        }
        this.setData({
          'matchHistoryList': this.data.matchHistoryList.concat(matchList),
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

  /**
   * 加载球员基本资料
   */
  loadPlayerBasicInfoNew: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('loadPlayerBasicInfoNew', {
      uid: this.data.uid,
      targetPlayerId: this.data.targetId
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        this.setData({
          'details': {
            name: data.username,
            portrait: data.portrait,
            signature: data.signature || '',
            age: data.birthday ? utils.formatAge(data.birthday) : '未知',
            height: data.height ? data.height + 'cm' : '未知',
            weight: data.weight ? data.weight + 'kg' : '未知',
            area: data.area || '未知',
            position: 1==data.position?'门将':2==data.position?'后卫':3==data.position?'中场':4==data.position?'前锋':'未知',
            combat: data.SkillCredit || '未知',
            intro: data.introduction || ' '
          }
        });
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
   * 记载球员所在球队
   */
  loadAllTeamsOfPlayer: function () {
    wx.api.post('loadAllTeamsOfPlayer', {
      uid: this.data.uid,
      playerId: this.data.targetId
    }, res => {
      if ('success' == res.data.status) {
        let captain = res.data.returndata.captain;
        let enrolled = res.data.returndata.enrolled;
        let list = captain.concat(enrolled).map(item => {
          return {
            targetType: 0,
            targetId: item.teamid,
            name: item.teamname,
            portrait: item.portrait,
            col2: item.position.length,
            col3: +item.memberNumber >= 0 ? item.memberNumber : 'N',
            col4: item.accepttime ? item.accepttime.replace(/\s[:\d]+$/, '') : '未知'
          }
        });
        this.setData({
          'teamList': list
        })
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    });
  },

  /**
   * 加载球员的历史战绩
   */
  loadPlayerMatchHistory: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('loadPlayerMatchHistory', {
      uid: this.data.uid,
      playerId: this.data.targetId,
      page: this.data.loadingPage,
      numberPerPage: this.data.numberPerPage
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let matchList = data.map(item => {
          return {
            matchId: item.matchId,
            matchTime: item.time ? item.time.replace(/:\d+$/, '') : '未知',
            homeTeamId: item.party_a_uid,
            homeTeamName: item.party_a,
            homeTeamPortrait: item.a_picture,
            homeScore: item.Score,
            awayTeamId: item.party_b_uid,
            awayTeamName: item.party_b,
            awayTeamPortrait: item.b_picture,
            awayScore: item.Lose,
            courtName: item.courtName,
            gameResult: item.gameResult,
            homeUniform: {
              coats: item.homeUniform.coatColor ? item.homeUniform.coatColor.replace('0x', '#') : '',
              pants: item.homeUniform.pantsColor ? item.homeUniform.pantsColor.replace('0x', '#') : '',
              socks: item.homeUniform.socksColor ? item.homeUniform.socksColor.replace('0x', '#') : ''
            },
            awayUniform: {
              coats: item.awayUniform.coatColor ? item.awayUniform.coatColor.replace('0x', '#') : '',
              pants: item.awayUniform.pantsColor ? item.awayUniform.pantsColor.replace('0x', '#') : '',
              socks: item.awayUniform.socksColor ? item.awayUniform.socksColor.replace('0x', '#') : ''
            }
          }
        });
        if (matchList.length < 1) {
          wx.showToast({
            title: '已全部加载'
          });
          return
        }
        this.setData({
          'matchHistoryList': this.data.matchHistoryList.concat(matchList),
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

  /**
   * 球员球队第三屏加载更多战绩
   */
  loadMoreMatch: function () {
    if (this.data.loadingMore) {
      return
    }
    this.setData({
      'loadingMore': true,
      'loadingPage': ++this.data.loadingPage
    });
    if (0 == this.data.targetType) {
      this.getTeamDataInfo()
    } else if (1 == this.data.targetType) {
      this.loadPlayerMatchHistory()
    }
  },

  /**
   * 加载赛事基本信息
   */
  gameBasicInfo: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('gameBasicInfo', {
      uid: this.data.uid,
      gameId: this.data.targetId
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let memberList = [];
        if (3 == data.gametype) {
          this.loadGroupPlaceForGame();
        } else {
          memberList = [{
            title: '',
            list: data.enrollmentList.map(item => {
              return {
                targetType: 0,
                targetId: item.teamId,
                name: item.teamName,
                portrait: item.icon
              }
            })
          }]
        }
        this.setData({
          'details': {
            name: data.gamename,
            portrait: data.portrait,
            signature: `${data.rule_name}制${2==data.gametype?1==data.roundRobin?'单循环联赛':'双循环联赛':'杯赛'} ${data.teamNumber}支球队参赛`,
            gameDuration: `${utils.shortDate(data.starttime)} 至 ${utils.shortDate(data.endtime)}`,
            holdCity: data.area || '未知',
            contacts: {
              contactName: data.contactName,
              contactId: data.contactId
            },
            enrollmentDeadline: data.enrollmentDeadline,
            associationName: data.associationName,
            sponsorList: data.sponsorList,
            intro: data.comments || ' '
          },
          'sliderBackgroundList': [data.coverPic || 'https://share.greenplayer.cn/share/img/association.png'],
          'memberList': memberList
        });
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
   * 加载杯赛参赛名单
   */
  loadGroupPlaceForGame: function () {
    wx.api.post('loadGroupPlaceForGame', {
      gameId: this.data.targetId
    }, res => {
      if ('success' == res.data.status) {
        let memberList = [];
        res.data.returndata.forEach(item => {
          let title = '';
          for (let p in item) {
            title = p;
          }
          memberList.push({
            title: title ? `${title}组` : '',
            list: item[title].map(item => {
              return {
                targetType: 0,
                targetId: item.tid,
                name: item.teamname,
                portrait: item.icon
              }
            })
          })
        });
        this.setData({
          'memberList': memberList
        })
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    });
  },

  /**
   * 加载赛事数据，赛程、积分、射手、助攻、纪律
   */
  // 加载赛程
  loadSetupGameScheduleCompletely: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.post('loadSetupGameScheduleCompletely', {
      uid: wx.getStorageSync('uid') || 300,
      gameId: this.data.targetId
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let list = [];
        let data = res.data.returndata.Turns;
        let turn3 = '';   // 淘汰赛第三轮，三四名决赛
        data.forEach(item => {
          if (item.isWinTurn == 1) {
            if (item.turn == 3) {
              turn3 = item.matchList;
              return
            }
            if (item.turn == 1 && turn3.length > 0) {
              item.matchList = turn3.concat(item.matchList);
            }
            let turnName = 8 == item.turn ? '1/8决赛'
                         : 4 == item.turn ? '1/4决赛'
                         : 2 == item.turn ? '1/2决赛'
                         : 1 == item.turn ? '决赛'
                         : '';
            list.push({
              turnName: turnName,
              groupList: formatGameSchedule(item)
            });
          } else {
            list.push({
              turnName: `第${item.turn}轮`,
              groupList: formatGameSchedule(item)
            })
          }
        });
        this.setData({
          'gameData.scheduleList': list,
          'gameData.currentTurn': res.data.returndata.currentTurn > list.length ? list.length - 1 : res.data.returndata.currentTurn - 1
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    })
  },
  // 加载积分榜
  getGroupMatchRank: function () {
    wx.showLoading({
      title: '正在加载'
    });
    wx.api.get(`/game/getGroupMatchRank.php?gameId=${this.data.targetId}`, res => {
        wx.hideLoading();
        if ('success' == res.data.status) {
          let list = [];
          let data = res.data.returndata
          if (data.length > 0 && data[0].teamId) {    // 联赛，无分组
            list.push({
              groupName: '',
              list: data.map(item => {
                return {
                  targetType: 0,
                  targetId: item.teamId,
                  col1: item.rank,
                  name: item.teamName,
                  portrait: item.portrait,
                  col3: -(-item.success - item.dual - item.lose),
                  col4: item.success,
                  col5: item.dual,
                  col6: item.lose,
                  col7: `${item.Score}/${item.Score - item.NetScore}`,
                  col8: item.credit
                }
              })
            });
          } else if (data.length > 0 && !data[0].teamId) {    // 杯赛，有分组
            data.forEach(item => {
              let groupName = '';
              for (let prop in item) {
                groupName = prop;
                break;
              }
              list.push({
                groupName: `${groupName}组`,
                list: Array.prototype.slice.call(item[groupName]).map(item => {
                  return {
                    targetType: 0,
                    targetId: item.teamId,
                    col1: item.rank,
                    name: item.teamName,
                    portrait: item.portrait,
                    col3: -(-item.success - item.dual - item.lose),
                    col4: item.success,
                    col5: item.dual,
                    col6: item.lose,
                    col7: `${item.Score}/${item.Score - item.NetScore}`,
                    col8: item.credit
                  }
                })
              })
            });
          }
          this.setData({
            'gameData.scoreList': list
          });
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            showCancel: false
          })
        }
    });
  },
  // 加载射手榜，助攻榜
  loadGameScoreRankList: function (rankType) {
      wx.showLoading({
        title: '正在加载'
      })
      wx.api.post('loadGameScoreRankList', {
        gameId: this.data.targetId,
        rankType: rankType
      }, res => {
        wx.hideLoading();
        if ('success' == res.data.status) {
          let list = res.data.returndata.map(item => {
            return {
              targetType: 1,
              targetId: item.uid,
              col1: item.rank,
              name: item.userName,
              portrait: item.userIcon,
              col3: item.teamName,
              col4: rankType == 1 ? `${item.totalScore}(${item.reserved})` : item.totalScore
            }
          });
          if (rankType == 1) {
            this.setData({
              'gameData.shooterList': list
            });
          } else if (rankType == 3) {
            this.setData({
              'gameData.assistsList': list
            });
          }
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.errMsg,
            showCancel: false
          })
        }
      })
  },
  // 加载赛事处罚列表
  loadGamePunishRankList: function () {
    wx.showLoading({
      title: '正在加载'
    })
    wx.api.post('loadGamePunishRankList', {
      gameId: this.data.targetId,
      orderType: 1
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let list = res.data.returndata.map((item, index) => {
          return {
            targetType: 0,
            targetId: item.teamId,
            col1: ++index,
            name: item.teamName,
            portrait: item.teamIcon,
            col3: `${item.totalRedCard}/${item.totalYellowCard}`,
            col4: `罚分${item.deductPoints || 0}`,
            list: item.players.map(player => {
              return {
                targetType: 1,
                targetId: player.uid,
                col1: ' ',
                name: player.userName,
                portrait: player.userIcon,
                col3: `${player.RedCard}/${player.YellowCard}`,
                col4: player.suspendCount > 0 ? `停赛${player.suspendCount}` : ' '
              }
            })
          }
        });
        this.setData({
          'gameData.punishList': list
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          showCancel: false
        })
      }
    })
  },
  // 切换轮次
  changeTurn: function (e) {
    let range = e.target.dataset.range;
    if (range < 0 && this.data.gameData.currentTurn > 0) {
      this.setData({
        'gameData.currentTurn': this.data.gameData.currentTurn - 1
      })
    } else if (range > 0 && this.data.gameData.currentTurn < this.data.gameData.scheduleList.length - 1) {
      this.setData({
        'gameData.currentTurn': this.data.gameData.currentTurn + 1
      })
    }
  },

  /**
   * 加入球队
   */
  tapJoinTeam: function () {
    if (wx.getStorageSync('uid')) {
      wx.navigateTo({
        url: `../jointeam/index?teamId=${this.data.targetId}`
      })
    } else {
      wx.navigateTo({
        url: '../login/index',
      })
    }
  },

  /**
   * 退出球队
   */
  tapQuitTeam: function () {
    let teamId = this.data.targetId;
    let teamBasicInfo = this.teamBasicInfo;
    wx.showModal({
      title: '提示',
      content: `确认退出"${this.data.details.name}"吗？`,
      success: function (res) {
        if (res.confirm) {
          wx.api.post('playerQuitTeam', {
            uid: wx.getStorageSync('uid'),
            playerId: wx.getStorageSync('roleId'),
            teamId: teamId
          }, res => {
            if ('success' == res.data.status) {
              wx.showModal({
                title: '提示',
                content: '退出球队成功',
                showCancel: false
              });
              teamBasicInfo();
            }
          })
        }
      } 
    })
  }
})


/**
 * 格式化赛程的数据
 */
var formatGameSchedule = function (data) {
  return data.matchList.map(group => {
    let groupName = '';
    for (let prop in group) {
      groupName = prop;
      break;
    }
    return {
      groupName: groupName ? `${groupName}组` : '',
      matchList: Array.prototype.slice.call(group[groupName]).map(item => {
        return {
          matchId: item.matchId,
          matchTime: item.matchTime ? item.matchTime.replace(/:\d+$/, '') : '未知',
          homeTeamId: item.party_a,
          homeTeamName: item.party_a_name,
          homeTeamPortrait: item.party_a_icon,
          homeScore: item.scores_a,
          awayTeamId: item.party_b,
          awayTeamName: item.party_b_name,
          awayTeamPortrait: item.party_b_icon,
          awayScore: item.scores_b,
          courtName: item.courtName,
          homeUniform: {
            coats: item.homeUniform.coatColor ? item.homeUniform.coatColor.replace('0x', '#') : '',
            pants: item.homeUniform.pantsColor ? item.homeUniform.pantsColor.replace('0x', '#') : '',
            socks: item.homeUniform.socksColor ? item.homeUniform.socksColor.replace('0x', '#') : ''
          },
          awayUniform: {
            coats: item.awayUniform.coatColor ? item.awayUniform.coatColor.replace('0x', '#') : '',
            pants: item.awayUniform.pantsColor ? item.awayUniform.pantsColor.replace('0x', '#') : '',
            socks: item.awayUniform.socksColor ? item.awayUniform.socksColor.replace('0x', '#') : ''
          }
        }
      })
    }
  })
}