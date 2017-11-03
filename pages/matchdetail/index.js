// pages/matchDetail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: {
      current: 0,
      list: ['详情', '名单']
    },
    matchId: '',
    activityType: '',
    activityId: '',
    teamId: '',
    isConvene: false,
    teamMemberIdList: [],
    againstInfo: '',
    details: '',
    eventList: [],
    formation: '',
    formationList: '',
    nameList: {},
    registInfo: '',
    unregistInfo: '',
    mvpInfo: {},
    playerList: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      'matchId': options.matchId,
      'activityType': options.activityType,
      'teamId': options.teamId
    });
    this.loadMatchResultPredictionPage();   // 加载比赛详情
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (1 == this.data.activityType && this.data.teamId) {    // 召集的分享
      let teamName = this.data.againstInfo[0] && this.data.againstInfo[0].homeTeamId == this.data.teamId ? this.data.againstInfo[0].homeTeamName : this.data.againstInfo[0].awayTeamName
      return {
        title: `${teamName || '球队'}  ${this.data.againstInfo[0].matchTime || '最近'}的一场比赛，快来报名吧~`,
        path: `/pages/matchdetail/index?matchId=${this.data.matchId}&activityType=${this.data.activityType}&teamId=${this.data.teamId}`
      }
    }
    return {
      title: `${this.data.againstInfo[0].homeTeamName || ''} VS ${this.data.againstInfo[0].awayTeamName || ''}`,
      path: `/pages/matchdetail/index?matchId=${this.data.matchId}`
    }
  },

  /**
   * nav点击处理
   */
  navChange: function (e) {
    var index = e.target.dataset.index;
    this.setData({
      'nav.current': index
    });
    if (1 == index && !this.data.nameList.hasLoad) {
      this.getActivitiesMatchEnroll();
    }
    if (3 == index && !this.data.mvpInfo.hasLoad) {
      this.loadMvpInfoForTeam();
    }
  },

  /**
   * 加载单场比赛详情
   */
  loadMatchResultPredictionPage: function () {
    wx.api.post('loadMatchResultPredictionPage', {
      uid: wx.getStorageSync('uid') || 300,
      matchId: this.data.matchId,
      teamId: '',
    }, res => {
      if ('success' == res.data.status) {
        let data = res.data.returndata
        wx.setNavigationBarTitle({
          title: data.gameName
        });
        this.setData({
          'againstInfo': [{
            matchId: this.data.matchId,
            matchTime: data.matchTime ? data.matchTime.replace(/:\d+$/, '') : '未知',
            homeTeamId: data.party_a,
            homeTeamName: data.a_name,
            homeTeamPortrait: data.a_icon,
            homeScore: data.cur_score_a,
            homePenaltyScore: data.penalty_score_a,
            homeUniform: {
              image: data.homeUniform.coatImg,
              coats: data.homeUniform.coatColor.replace('0x', '#'),
              pants: data.homeUniform.pantsColor.replace('0x', '#'),
              socks: data.homeUniform.socksColor.replace('0x', '#')
            },
            awayTeamId: data.party_b,
            awayTeamName: data.b_name,
            awayTeamPortrait: data.b_icon,
            awayScore: data.cur_score_b,
            awayPenaltyScore: data.penalty_score_b,
            awayUniform: {
              image: data.awayUniform.coatImg,
              coats: data.awayUniform.coatColor.replace('0x', '#'),
              pants: data.awayUniform.pantsColor.replace('0x', '#'),
              socks: data.awayUniform.socksColor.replace('0x', '#')
            },
            courtName: data.courtName || '未知'
          }],
          'details': {
            gameName: data.gameName,
            scale: data.scale,
            scaleName: `${data.scale}人制`,
            areaName: data.areaName,
            uniform: {
              homeName: data.a_name,
              homeColor: data.homeUniform.coatColor.replace('0x', '#'),
              awayName: data.b_name,
              awayColor: data.awayUniform.coatColor.replace('0x', '#')
            },
            post: {
              homeName: data.a_name,
              awayName: data.b_name,
              posterA: data.posterA,
              posterB: data.posterB
            },
            refereeList: data.refereeList,
            noteInfo: data.noteInfo || ' '
          }
        });
        // 加载天气
        wx.api.get(`/common/getWeatherByCityId.php?cityId=${data.areaId}&date=${data.matchTime}`, res => {
          if ('success' == res.data.status) {
            this.setData({
              'details.weather': res.data.returndata || ' '
            })
          }
        });
        // 判断比赛是否开始，已开始就显示所有tab，包括事件、mvp；未开始只显示详情跟名单
        let matchTime = data.matchTime ? data.matchTime.replace(/-/g, '/') : '';   // ios 兼容
        if (new Date() > new Date(matchTime)) {
          this.setData({
            'nav': {
              current: 2,
              list: ['详情', '名单', '事件', '评选']
            }
          });
          // 加载事件详情
          this.loadMatchAllPartEventList(data);
          // 根据赛制加载阵型数据
          this.loadSystemFormationTemplate(data);
        } else if (this.data.activityType == 1 && this.data.teamId) {   // 判断是否是召集页面
          this.setData({
            'nav': {
              current: 1,
              list: ['详情', '名单']
            },
            'isConvene': true
          });
          // 加载报名名单
          this.getActivitiesMatchEnroll();
          // 加载该球队的所有成员，以判断当前用户是否是球队成员
          this.teamBasicInfo();
        } else {
          this.loadSystemFormationTemplate(data);
        }
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    });
  },

  /**
   * 加载事件详情
   * @matchResult：比赛数据，用于区分主客队及获取需要补录的进球数目
   */
  loadMatchAllPartEventList: function (matchResult) {
    wx.api.post('loadMatchAllPartEventList', {
      uid: wx.getStorageSync('uid') || 300,
      matchId: this.data.matchId
    }, res => {
      if ('success' == res.data.status) {
        let list = res.data.returndata.map(item => {
          return {
            startTime: item.isPenalty == 1 ? '点球大战' : item.startTime ? item.startTime.replace(/(\d+-\d+-\d+\s)|(:\d+)$/g, '') : '开始',
            endTime: item.endTime ? item.endTime.replace(/(\d+-\d+-\d+\s)|(:\d+)$/g, '') : '结束',
            list: item.eventInfo.map(item => {
              return {
                happenTime: item.HappenTime,
                eventType: item.eventType,
                isHomeTime: item.teamId == matchResult.party_a,
                isYellowToRed: item.isYellowToRed,
                playerList: item.playerList.map(player => {
                  return {
                    playerInfo: this.formatEventPlayer(item.eventType, player)
                  }
                }),
                additionalEventType: +item.eventType + 1,
                additional: item.additional.map(player => {
                  return {
                    playerInfo: this.formatEventPlayer(item.eventType, player)
                  }
                })
              }
            })
          }
        });
        // 补录进球，进球事件与比分不相等时操作
        // let needMarkupA = matchResult.cur_score_a - matchResult.events.filledScoresOfA;
        // let needMarkupB = matchResult.cur_score_b - matchResult.events.filledScoresOfB;
        // while(needMarkupA > 0) {
        //   list[0].list.push({
        //     happenTime: 0,
        //     eventType: -1,
        //     isHomeTime: true,
        //     playerList: [{
        //       playerInfo: '进球'
        //     }]
        //   })
        //   needMarkupA--;
        // };
        // while (needMarkupB > 0) {
        //   list[0].list.push({
        //     happenTime: 0,
        //     eventType: -1,
        //     isHomeTime: false,
        //     playerList: [{
        //       playerInfo: '进球'
        //     }]
        //   })
        //   needMarkupB--;
        // };
        this.setData({'eventList': list});
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
   * 根据赛制加载阵型
   * @matchResult：比赛数据，取双方阵型id，通过比对加载的阵型数据，得到双方的阵型
   */
  loadSystemFormationTemplate: function (matchResult) {
    let formationIdA = matchResult.formationIdA
    let formationIdB = matchResult.formationIdB
    wx.api.post('loadSystemFormationTemplate', {
      uid: wx.getStorageSync('uid') || 300,
      scale: matchResult.scale
    }, res => {
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let obj = {
          formationHome: data[0],
          formationAway: data[0]
        };
        data.forEach(item => {
          if (+formationIdA === +item.id) {
            obj.formationHome = item;
          }
          if (+formationIdB === +item.id) {
            obj.formationAway = item;
          }
        });
        this.setData({
          'formation': obj
        })
      }
    })
  },

  /**
   * 加载参赛报名名单
   */
  getActivitiesMatchEnroll: function () {
    wx.showLoading({
      title: '正在加载',
    });
    wx.api.post('getActivitiesMatchEnroll', {
      uid: wx.getStorageSync('uid') || 300,
      matchId: this.data.matchId
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        // 非召集
        if (!this.data.isConvene) {
          let firstListA = [];
          let firstListB = [];
          let benchListA = [];
          let benchListB = [];
          data.registerInfo_a.forEach(item => {
            let playerInfo = {
              name: item.username,
              portrait: item.portrait,
              roleName: item.roleName || '--',
              memberNumber: item.memberNumber >= 0 ? item.memberNumber : 'N',
              x: item.coordinateX,
              y: item.coordinateY
            }
            if (+item.isFirst == 1) {
              firstListA.push(playerInfo);
            } else {
              benchListA.push(playerInfo);
            }
          });
          data.registerInfo_b.forEach(item => {
            let playerInfo = {
              name: item.username,
              portrait: item.portrait,
              roleName: item.roleName || '--',
              memberNumber: item.memberNumber >= 0 ? item.memberNumber : 'N',
              x: item.coordinateX,
              y: item.coordinateY
            }
            if (+item.isFirst == 1) {
              firstListB.push(playerInfo);
            } else {
              benchListB.push(playerInfo);
            }
          });
          let formationA = this.formatFormation(firstListA, this.data.formation.formationHome.coordinate)
          let formationB = this.formatFormation(firstListB, this.data.formation.formationAway.coordinate)
          formationA.reverse();   // 主队的阵型需要调转
          this.setData({
            'nameList': {
              hasLoad: true,
              firstList: [firstListA, firstListB],
              benchList: [benchListA, benchListB]
            },
            'formationList': [formationA, formationB]
          });
        } else {    // 召集的
          var registList, activityId, unregistInfo;
          if (data.party_a === this.data.teamId) {
            registList = data.registerInfo_a;
            activityId = data.activityIdA;
            unregistInfo = data.unRegisterInfo_a;
          } else if (data.party_b === this.data.teamId) {
            registList = data.registerInfo_b;
            activityId = data.activityIdB;
            unregistInfo = data.unRegisterInfo_b;
          }
          let registInfo = {
            enroll: [],
            leave: [],
            undetermined: []
          }
          registList.forEach(item => {
            let obj = {
              playerId: item.uid,
              portrait: item.portrait,
              name: item.username,
              memberNumber: item.memberNumber
            }
            if (+item.registerType === 100) {
              registInfo.enroll.push(obj)
            } else if (+item.registerType === -1) {
              registInfo.leave.push(obj)
            } else if (+item.registerType === 0) {
              registInfo.undetermined.push(obj)
            }
          });
          this.setData({
            'nameList.hasLoad': true,
            'registInfo': registInfo,
            'unregistInfo': unregistInfo,
            'activityId': this.data.activityId || activityId
          });
        }
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    });
  },

  /**
   * 获取球队基本信息以及球队成员
   */
  teamBasicInfo: function () {
    wx.api.post('teamBasicInfo', {
      uid: wx.getStorageSync('uid') || 300,
      teamId: this.data.teamId
    }, res => {
      if ('success' == res.data.status) {
        this.setData({
          'teamMemberIdList': res.data.returndata.playerList.map(item => item.userid)
        })
      }
    })
  },

  /**
   * 点击召集反馈
   */
  tapFeedback: function (e) {
    let uid = wx.getStorageSync('uid');
    let playerId = wx.getStorageSync('roleId');
    let registerType = e.target.dataset.type;
    if (!uid || !playerId) {
      wx.navigateTo({
        url: '../login/index'
      })
      return;
    }
    if (this.data.teamMemberIdList.indexOf(playerId) < 0) {
      wx.showModal({
        title: '提示',
        content: '您还不是该球队成员，不能操作，点击确定即可加入球队并报名！',
        success: res => {
          if (res.confirm) {
            this.playerJoinTeam(registerType);
          }
        }
      })
      return
    }
    this.registerForActivity(registerType);
  },

  /**
   * 球员加入球队
   */
  playerJoinTeam: function (registerType) {
    let playerId = wx.getStorageSync('roleId')
    wx.api.post('baseApiEntry', {
      method: 'team_player_playerJoinTeam',
      uid: wx.getStorageSync('uid'),
      playerId: playerId,
      teamId: this.data.teamId
    }, res => {
      if ('success' == res.data.status) {
        this.data.teamMemberIdList.push(playerId)
        this.setData({
          'teamMemberIdList': this.data.teamMemberIdList
        });
        this.registerForActivity(registerType)
      }
    });
  },

  /**
   * 召集反馈，报名请假待定
   */
  registerForActivity: function (registerType) {
    wx.showLoading({
      title: '正在提交'
    })
    wx.api.post('registerForActivity', {
      activityId: this.data.activityId,
      isManager: '0',
      participateNumbers: '1',
      participateType: registerType,
      playerId: wx.getStorageSync('roleId'),
      uid: wx.getStorageSync('uid'),
      teamId: this.data.teamId
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        this.getActivitiesMatchEnroll();
        let pages = getCurrentPages();
        pages[pages.length - 2] && pages[pages.length - 2].showPersonalActivitiesAtCertainPeriod && pages[pages.length - 2].showPersonalActivitiesAtCertainPeriod();
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
   * 加载 MVP 评选列表
   */
  loadMvpInfoForTeam: function () {
    wx.showLoading({
      title: '正在加载',
    });
    wx.api.post('loadMvpInfoForTeam', {
      uid: wx.getStorageSync('uid') || 300,
      matchId: this.data.matchId,
      teamId: ''
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        let data = res.data.returndata;
        let listA = data.MvpPlayerListA.map(item => {
          return {
            isVote: item.isVote,
            memberNumber: item.memberNumber >= 0 ? item.memberNumber : 'N',
            roleName: item.roleName || '--',
            portrait: item.portrait,
            name: item.username,
            id: item.uid,
            supportNumber: item.supportNumber,
            supportRate: data.supportNumberTeamA > 0 ? item.supportNumber / data.supportNumberTeamA * 100 : 0
          }
        });
        let listB = data.MvpPlayerListB.map(item => {
          return {
            isVote: item.isVote,
            memberNumber: item.memberNumber >= 0 ? item.memberNumber : 'N',
            roleName: item.roleName || '--',
            portrait: item.portrait,
            name: item.username,
            id: item.uid,
            supportNumber: item.supportNumber,
            supportRate: data.supportNumberTeamB > 0 ? item.supportNumber / data.supportNumberTeamB * 100 : 0
          }
        });
        this.setData({
          'mvpInfo': {
            hasLoad: true,
            deadline: data.deadlineA > data.deadlineB ? data.deadlineA : data.deadlineB,
            supportNumberTeamA: data.supportNumberTeamA,
            supportNumberTeamB: data.supportNumberTeamB
          },
          'playerList': [listA, listB]
        });
      } else {
        wx.showModal({
          title: '',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    });
  },

  /**
   * 点击投票
   */
  voteForPlayer: function () {
  },

  /**
   * 格式化事件轴的球员信息
   * @eventType：事件类型
   * @player：产生该事件所对应的球员信息，包括名字和号码...
   */
  formatEventPlayer: function (eventType, player) {
    if (12 == eventType) {
      return '乌龙球'
    } else if (-1 == eventType) {
      return '进球'
    }
    if (+player.playerId < 0) {
      if (5 == eventType) {
        return '红牌'
      } else if (6 == eventType) {
        return '黄牌'
      } else if (1 == eventType) {
        return '进球'
      }
    }
    let res = `${player.memberNumber >= 0 ? player.memberNumber : 'N'}号 ${player.playerName}`
    if (17 == eventType) {
      return player.playerName ? res : '点球'
    }
    return res
  },

  /**
   * 把首发球员的的位置与阵型对应起来
   * @format：首发名单
   * @tacticsBoard：该球队所使用的阵型
   */
  formatFormation: function (format, tacticsBoard) {
    // 把一维数组的阵型根据y轴位置转换为二维的阵型
    let tb = []
    for (let i = 0; i < tacticsBoard.length; i++) {
      tb[tacticsBoard[i].y] = tb[tacticsBoard[i].y] || []
      tb[tacticsBoard[i].y].push(tacticsBoard[i])
    }
    tb = tb.filter(item => item);
    return tb.map(item => {
      return item.map(inItem => {
        for (let i = 0; i < format.length; i++) {
          if (format[i].x === inItem.x && format[i].y === inItem.y) {
            return {
              memberNumber: format[i].memberNumber || 'N',
              playerName: format[i].name
            }
          }
        }
        return {
          memberNumber: 'N'
        }
      })
    });
  }
})
