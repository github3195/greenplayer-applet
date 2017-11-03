2/**
 * 这里集中管理所有数据请求接口
 * 2017-10-13
 * @author wsp
 */

// post 请求
const $post = function (url, data, success, fail) {
  wx.request({
    url: url,
    method: 'post',
    data: data,
    dataType: 'json',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: success,
    fail: fail ? fail : err => {
      wx.showModal({
        title: '提示',
        content: err.errMsg,
        showCancel: false
      })
      wx.hideLoading();
    }
  })
};

// get 请求
const $get = function (url, success, fail) {
  wx.request({
    url: url,
    method: 'get',
    dataType: 'json',
    success: success,
    fail: fail ? fail : err => {
      wx.showModal({
        title: '提示',
        content: err.errMsg,
        showCancel: false
      })
      wx.hideLoading();
    }
  })
};

// 版本号
const version = 'applet 1.0.0';

// api 地址
const apiAddress = (function (code) {
  return 1 == code ? 'https://online.greenplayer.cn/E602925F24B0F5A/api'       // 正式
       : 2 == code ? 'http://dev.greenplayer.cn/api'                           // 伪正式
       : 3 == code ? 'http://lyck_dev.greenplayer.cn/api'                      // 测试
       : ''
}(1))

// 所有前缀相同的api的路径
const pathArray = [
  '/common/baseApiEntry.php',                                       //  通用接口入口，data 参数需定义好 method 字段
  '/login/userLogin.php',                                           // 【登陆接口】手机号和密码 http://120.24.236.54/view.php?id=1
  '/login/userRegister.php',                                        // 【会员注册】 http://120.76.27.54/view.php?id=3
  '/player/loadPlayerBasicInfoNew.php',                             // 【球员主页】球员基本信息 http://120.76.27.54/view.php?id=7
  '/login/changePassword.php',                                      // 【修改密码】 http://120.76.27.54/view.php?id=13
  '/team/teamBasicInfo.php',                                        // 【球队主页】首页 http://120.76.27.54/view.php?id=21
  '/team/joinTeamApplication.php',                                  //  申请加入球队 http://120.24.236.54/view.php?id=80
  '/game/loadGroupPlaceForGame.php',                                // 【报名管理】抽签后读取分组情况 http://120.76.27.54/view.php?id=143
  '/game/gameBasicInfo.php',                                        // 【非PK赛事的基本信息】 http://mall.greenplayer.cn/view.php?id=151
  '/team/loadTeamMatchHistory.php',                                 // 【球队主页】历史战绩 http://120.76.27.54/view.php?id=176
  '/player/loadPlayerMatchHistory.php',                             // 【球员主页】球员历史战绩 http://120.76.27.54/view.php?id=177
  '/team/loadAllTeamsOfPlayer.php',                                 // 【球队主页】显示自己所在的所有球队 http://120.76.27.54/view.php?id=195
  '/game/loadGameScoreRankList.php',                                // 【比赛主页】比赛的射手与助攻榜 http://120.24.236.54/view.php?id=199
  '/game/loadSetupGameScheduleCompletely.php',                      //  获取赛程 http://120.24.236.54/view.php?id=223
  '/team/loadAllTeamsByRank.php',                                   // 【查找球队】所有的球队列表 http://120.76.27.54/view.php?id=232
  '/game/loadMyGameHomepage.php',                                   //  新版本比赛主页 http://120.76.27.54/view.php?id=259
  '/team/activities/registerForActivity.php',                       // 【活动召集】报名参加一个活动 http://120.24.236.54/view.php?id=267
  '/common/loadAllMyRoles.php',                                     // 【角色切换】显示自己的球队和比赛 http://120.76.27.54/view.php?id=269
  '/match/loadMatchResultPredictionPage.php',                       // 【比赛主页-竞猜】竞猜的主页 http://120.76.27.54/view.php?id=299
  '/game/loadGamePunishRankList.php',                               // 【赛事判罚榜】红牌黄牌榜 http://120.24.236.54/view.php?id=317
  '/team/joinTeamApplicationWithInvitationCode.php',                // 【球员邀请】根据邀请码加入球队 http://120.24.236.54/view.php?id=324
  '/match/loadAllMatchesHomepage.php',                              // 【赛事主页】读取所有比赛的列表主页 http://120.76.27.54/view.php?id=330
  '/common/searchAllInfoByCondition.php',                           // 【新版本查询】查询比赛，球队等 http://mall.greenplayer.cn/view.php?id=350
  '/team/activities/showPersonalActivitiesAtCertainPeriod.php',     // 【队长新界面】个人日程月历试图 http://120.24.236.54/view.php?id=377
  '/team/loadTeamInfoOfPlayerView.php',                             // 【球员新界面】球员的主界面 http://120.76.27.54/view.php?id=382
  '/common/getWeatherByCityId.php',                                 //  天气预报信息 http://120.76.27.54/view.php?id=450
  '/game/getActivitiesMatchEnroll.php',                             //  比赛活动报名列表 http://120.76.27.54/view.php?id=465
  '/match/loadMvpInfoForTeam.php',                                  //  加载mvp界面 http://120.76.27.54/view.php?id=482
  '/team/gameManagement/loadAllGamesEventParticipate.php',          //  参加赛事关注同城赛事列表 http://mall.greenplayer.cn/view.php?id=478
  '/player/loadAllPlayersInfo.php',                                 //  球员数据列表 http://120.76.27.54/view.php?id=486
  '/player/playerQuitTeam.php',                                     //  球员退出球队 http://120.24.236.54/view.php?id=546
  '/match/loadSystemFormationTemplate.php',                         //  加载系统阵型坐标根据赛制人数 http://120.76.27.54/view.php?id=632
  '/match/loadMatchAllPartEventList.php',                           //  加载单场比赛事件所有分节列表 http://120.76.27.54/view.php?id=661
  '/player/activities/showActivitiesListOfPlayer.php'               //  加载球员的活动列表 http://120.76.27.54/view.php?id=682
]

// 导出 api 对象，并挂到 wx 对象上，wx.api.method()
module.exports = {
  // 地址前缀相同的通用接口, urlKey是路径文件名
  post: function (urlKey, data, success, fail) {
    let len = pathArray.length;
    let apiPath = '';
    for(let i = 0; i < len; i++) {
      if (new RegExp(urlKey).test(pathArray[i])) {
        apiPath = pathArray[i];
        break;
      }
    }
    data.version = version;
    $post(`${apiAddress}${apiPath}`, { json: JSON.stringify(data) }, success);
  },
  // get 方法调用   url 不包括服务'器地址/api'
  get: function (url, success, fail) {
    $get(`${apiAddress}${url}`, success);
  },
  // 获取验证码
  getCode: function (data, success, fail) {
    let url = 'https://share.greenplayer.cn/share/app/team/getCode.php';
    data.version = version;
    $post(url, data, success, fail);
  },
  // 检验验证码
  checkCode: function (data, success, fail) {
    let url = 'https://share.greenplayer.cn/share/app/team/checkCode.php';
    data.version = version;
    $post(url, data, success, fail);
  },
  // 把 post 和 get 也暴露出去，以应对更多请求场景
  $post: $post,
  $get: $get
}
