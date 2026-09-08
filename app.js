// app.js —— 全局逻辑
App({
  globalData: {
    // 当前登录用户（演示数据；真实项目替换为 wx.login + code2Session）
    user: null,
    // 订阅消息开关（演示用，接入真实订阅消息后替换 templateIds）
    notifySettings: {
      feed: true,      // 投喂提醒
      health: true,    // 健康提醒
      lost: true       // 走失推送
    },
    theme: 'warm'
  },

  onLaunch() {
    // 恢复登录态
    try {
      const user = wx.getStorageSync('loginUser');
      if (user) this.globalData.user = user;
    } catch (e) {}
    // 从缓存恢复通知设置
    try {
      const saved = wx.getStorageSync('notifySettings');
      if (saved) this.globalData.notifySettings = saved;
    } catch (e) {}
  },

  // 是否已登录
  isLogin() {
    return !!(this.globalData.user && this.globalData.user.openid);
  },

  // 微信登录（演示：wx.login 取 code 模拟换取 openid；开发者工具会进入 fail 分支）
  login(cb) {
    wx.login({
      success: (res) => {
        // 真实场景：携带 res.code 请求后端 code2Session 换取 openid/session_key
        this.afterLogin(res.code ? 'wx' + res.code.slice(0, 6) : 'demo-openid', cb);
      },
      fail: () => {
        this.afterLogin('demo-openid-' + Date.now(), cb);
      }
    });
  },

  afterLogin(openid, cb) {
    const base = {
      nickName: '铲屎官' + openid.slice(-4),
      avatarColor: '#F47521',
      openid,
      avatar: ''
    };
    // 合并上一次保存的昵称/头像/签名
    const old = this.globalData.user || {};
    const user = Object.assign({}, base, {
      nickName: old.nickName || base.nickName,
      avatarColor: old.avatarColor || base.avatarColor,
      bio: old.bio || '新晋铲屎官，请多指教 🐾'
    });
    this.globalData.user = user;
    wx.setStorageSync('loginUser', user);
    if (cb) cb(user);
  },

  // 退出登录
  logout() {
    this.globalData.user = null;
    wx.removeStorageSync('loginUser');
  },

  // 更新用户资料
  updateUser(patch) {
    if (!this.globalData.user) return null;
    const user = Object.assign({}, this.globalData.user, patch);
    this.globalData.user = user;
    wx.setStorageSync('loginUser', user);
    return user;
  },

  // 更新通知开关
  setNotify(key, val) {
    this.globalData.notifySettings[key] = val;
    wx.setStorageSync('notifySettings', this.globalData.notifySettings);
  },

  // 全局登录引导：未登录时弹窗引导登录
  ensureLogin(desc) {
    if (this.isLogin()) return true;
    wx.showModal({
      title: '🐾 先登录一下吧',
      content: (desc || '该操作需要登录后使用') + '，是否立即使用微信登录？',
      confirmText: '微信登录',
      confirmColor: '#F47521',
      success: (r) => { if (r.confirm) wx.navigateTo({ url: '/pages/login/login?from=modal' }); }
    });
    return false;
  },

  // ===== 定位授权工具（调用手机定位 + 征得用户同意）=====
  // cb({status:'ok', lat, lng}) / status: 'deny' | 'fail'
  getLocation(cb) {
    // 1) 先说明用途并请求授权
    wx.getSetting({
      success: (res) => {
        const auth = res.authSetting['scope.userLocation'];
        if (auth === false) {
          // 用户之前拒绝过：引导去设置开启
          wx.showModal({
            title: '需要定位权限',
            content: '开启定位后，才能记录宠物轨迹、查看附近宠物与好店。是否去设置中允许使用位置信息？',
            confirmText: '去设置',
            confirmColor: '#F47521',
            success: (r) => { if (r.confirm) wx.openSetting(); if (cb) cb({ status: 'deny' }); }
          });
          return;
        }
        if (auth === true || auth === undefined) {
          // 2) 首次会弹系统授权框；已授权直接取
          wx.getLocation({
            type: 'gcj02',
            success: (res) => cb && cb({ status: 'ok', lat: res.latitude, lng: res.longitude, speed: res.speed || 0, accuracy: res.accuracy || 0 }),
            fail: (err) => {
              if (err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
                wx.showModal({
                  title: '需要定位权限',
                  content: '定位被拒绝，将无法使用附近功能。是否去设置中开启？',
                  confirmText: '去设置',
                  success: (r) => { if (r.confirm) wx.openSetting(); if (cb) cb({ status: 'deny' }); }
                });
              } else {
                if (cb) cb({ status: 'fail' });
              }
            }
          });
        }
      },
      fail: () => cb && cb({ status: 'fail' })
    });
  }
});
