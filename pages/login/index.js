// pages/login/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'login',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    signupText: '还没有账号？去注册',
    userName: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
    phoneImperfect: true,
    imperfect: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
   * 输入的时候进行的处理
   */
  inputData: function (e) {
    let type = e.target.dataset.type;
    let val = e.detail.value;
    if ('tel' == type) {
      let phoneImperfect = /(13\d|14[57]|15[^4,\D]|17[13678]|18\d)\d{8}|170[0589]\d{7}/.test(val) ? false : true;
      this.setData({
        'telephone': val,
        'phoneImperfect': phoneImperfect
      });
    } else if ('psd' == type) {
      this.setData({
        'password': val
      });
    } else if ('cpsd' == type) {
      this.setData({
        'confirmPassword': val
      });
    } else if ('un' == type) {
      this.setData({
        'userName': val
      });
    } else if ('code' == type) {
      this.setData({
        'verificationCode': val
      });
    }
    if ('login' == this.data.type) {
      let b = this.data.telephone && this.data.password ? false : true
      this.setData({
        'imperfect': b
      });
    } else if ('signup' == this.data.type) {
      let b = this.data.userName && this.data.telephone && this.data.password && this.data.verificationCode ? false : true
      this.setData({
        'imperfect': b
      });
    } else if ('reset' == this.data.type) {
      let b = this.data.telephone && this.data.password && this.data.verificationCode ? false : true
      this.setData({
        'imperfect': b
      });
    }
  },

  /**
   * 处理页面切换
   */
  switchLogin: function (e) {
    if ('login' == this.data.type) {
      this.setData({
        type: 'signup',
        signupText: '已有账号？去登录'
      })
    } else if ('signup' == this.data.type) {
      this.setData({
        type: 'login',
        signupText: '还没有账号？去注册'
      })
    } else if ('reset' == this.data.type) {
      this.setData({
        type: 'login',
        signupText: '还没有账号？去注册'
      })
    }
    // 初始化基础数据
    this.setData({
      userName: '',
      telephone: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
      imperfect: true
    })
  },

  /**
   * 切换到重置密码
   */
  switchReset: function (e) {
    this.setData({
      type: 'reset',
      signupText: '返回登录'
    })
  },

  /**
   * 点击登录
   */
  tapLogin: function (e) {
    wx.showLoading({
      title: '正在登录',
    });
    wx.api.post('userLogin', {
      telephone: this.data.telephone,
      password: this.data.password,
      source: 'wap'
    }, res => {
      wx.hideLoading()
      let data = res.data;
      if ('success' == data.status) {
        this.setUserInfo(data);
        wx.navigateBack();
      } else {
        wx.showModal({
          title: '提示',
          content: data.errMsg,
          showCancel: false
        });
      }
    });
  },

  /**
   * 获取验证码
   */
  getCode: function (e) {
    wx.showLoading({
      title: '正在发送',
    });
    wx.api.getCode({
      data: this.data.telephone
    }, res => {
      wx.hideLoading();
      if (200 == res.status) {
        wx.showToast({
          title: '已发送',
        });
      } else {
        wx.showModal({
          title: '提示',
          content: res.error
        });
      }
    });
  },

  /**
   * 点击注册
   */
  tapSignup: function (e) {
    wx.showLoading({
      title: '正在注册',
    });
    wx.api.post('userRegister', {
      userName: this.data.userName,
      telephone: this.data.telephone,
      password: this.data.password,
      code: this.data.code
    }, res => {
      wx.hideLoading()
      let data = res.data;
      if ('success' == data.status) {
      } else {
        wx.showModal({
          title: '提示',
          content: data.errMsg,
          showCancel: false
        });
      }
    });
  },

  /**
   * 点击重置密码
   */
  tapReset: function (e) {
    wx.showLoading({
      title: '正在重置',
    });
    wx.api.post('changePassword', {
      telephone: this.data.telephone,
      password: this.data.password,
      code: this.data.code
    }, res => {
      wx.hideLoading()
      let data = res.data;
      if ('success' == data.status) {
      } else {
        wx.showModal({
          title: '提示',
          content: data.errMsg,
          showCancel: false
        });
      }
    });
  },

  /**
   * 点击微信授权登录
   */
  authorizedLogin: function (e) {
    wx.showLoading({
      title: '正在登录',
    });
    wx.login({
      success: res => {
        // platform=applet 告诉后台是小程序的授权登录，以更换成小程序的APPID和appsecret
        wx.api.$get(`https://share.greenplayer.cn/share/app/team/getUserInfo.php?code=${res.code}&state=2&type=2&platform=applet`, res => {
          wx.hideLoading()
          let data = JSON.parse(res.data.trim());
          if ('success' == data.status) {
            this.setUserInfo(data);
            wx.navigateBack();
          } else {
            wx.showModal({
              title: '提示',
              content: data.erMsg,
              showCancel: false
            })
          }
        })
      }
    })
  },

  /**
   * 设置存储用户登录信息
   */
  setUserInfo: function (data) {
    wx.setStorageSync('userInfo', data.userinfo);   // 存储用户信息
    wx.setStorageSync('playerInfo', data.playerInfo);   // 存储默认球员信息
    wx.setStorageSync('uid', data.userinfo.uid);    // 存储用户ID
    wx.setStorageSync('token', data.userinfo.token);    // 存储token
    wx.setStorageSync('roleId', data.playerInfo.playerId);  // 存储当前角色ID
    wx.setStorageSync('roleType', '1');   // 存储当前角色类型 0:球队; 1:球员; 2:比赛; 3:裁判; 4:协会; 5:教练; 6:俱乐部; 7:球迷会
    let pages = getCurrentPages();
    pages[pages.length - 2].showPersonalActivitiesAtCertainPeriod && pages[pages.length - 2].showPersonalActivitiesAtCertainPeriod();
    pages[pages.length - 2].loadPlayerBasicInfoNew && pages[pages.length - 2].loadPlayerBasicInfoNew();
  }
})
