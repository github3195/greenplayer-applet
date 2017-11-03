// pages/joinTeam/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    teamId: '',
    applyType: 0,
    inviteCode: [],
    markText: '',
    focusInput: [false, false, false, false]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      'teamId': options.teamId
    });
    wx.setNavigationBarTitle({
      title: '申请入队'
    });
  },

  /**
   * 切换申请方式
   */
  changeApplyType: function (e) {
    this.setData({
      applyType: e.currentTarget.dataset.type
    });
  },

  /**
   * 输入验证码
   */
  setInviteCode: function (e) {
    let val = e.detail.value
    let index = e.target.dataset.codei;
    let array = this.data.inviteCode;
    array[+index] = val;
    let focusInput = [false, false, false, false];
    if (index < 3) {
      focusInput[++index] = true;
    }
    this.setData({
      'inviteCode': array,
      'focusInput': focusInput
    });
  },

  /**
   * 输入验证信息
   */
  markInput: function (e) {
    this.setData({
      'markText': e.detail.value
    });
  },

  /**
   * 点击确认提交
   */
  tapBottomButton: function (e) {
    if (1 == this.data.applyType) {
      this.joinTeamApplicationWithInvitationCode();
    } else if (2 == this.data.applyType) {
      this.joinTeamApplication();
    }
  },

  /**
   * 邀请码入队
   */
  joinTeamApplicationWithInvitationCode: function () {
    wx.showLoading({
      title: '正在提交'
    });
    wx.api.post('joinTeamApplicationWithInvitationCode', {
      uid: wx.getStorageSync('uid'),
      playerId: wx.getStorageSync('roleId'),
      teamId: this.data.teamId,
      invitationCode: this.data.inviteCode.join('')
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        wx.showModal({
          title: '提示',
          content: '加入球队成功',
          showCancel: false,
          success: function (r) {
            if (r.confirm) {
              let pages = getCurrentPages();
              pages[pages.length - 2].teamBasicInfo();
              wx.navigateBack();
            }
          }
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    })
  },

  /**
   * 填写验证信息入队
   */
  joinTeamApplication: function () {
    wx.showLoading({
      title: '正在提交'
    });
    wx.api.post('joinTeamApplication', {
      userid: wx.getStorageSync('uid'),
      playerId: wx.getStorageSync('roleId'),
      teamid: this.data.teamId,
      msg: this.data.markText
    }, res => {
      wx.hideLoading();
      if ('success' == res.data.status) {
        wx.showModal({
          title: '提示',
          content: '提交申请成功，请等待球队管理员审核',
          showCancel: false,
          success: function (r) {
            if (r.confirm) {
              wx.navigateBack();
            }
          }
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          showCancel: false
        });
      }
    })
  }
})