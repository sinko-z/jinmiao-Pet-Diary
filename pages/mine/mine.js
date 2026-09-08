const mock = require('../../utils/mock.js');

Page({
  data: {
    login: false,
    user: null,
    merchantApp: null,
    myPets: [],
    notify: { feed: true, health: true, lost: true },
    collectedCount: 0,
    myMoments: 0
  },

  refresh() {
    const app = getApp();
    const login = app.isLogin();
    const user = app.globalData.user;
    // 参与档案：未登录展示示例，登录后展示“我”的档案
    const myName = login ? user.nickName : '小喵';
    const seen = {};
    const myPets = mock.pets.filter(p => p.members.some(m => m.name === myName)).filter(p => (seen[p.id] ? false : (seen[p.id] = true)));
    let merchantApp = null;
    try { merchantApp = wx.getStorageSync('merchantApp') || null; } catch (e) {}
    // 预计算头像首字
    if (user) user.firstChar = user.nickName.slice(0, 1);
    this.setData({
      login,
      user,
      merchantApp,
      myPets: myPets.length ? myPets : mock.pets.slice(0, 2),
      collectedCount: mock.knowledge.filter(k => k.collected).length,
      myMoments: mock.moments.filter(m => m.author === myName || m.author === '我').length,
      notify: app.globalData.notifySettings
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.refresh();
  },

  onNotify(e) {
    const key = e.currentTarget.dataset.key;
    const val = e.detail.value;
    getApp().setNotify(key, val);
    this.setData({ ['notify.' + key]: val });
    wx.showToast({ title: val ? '提醒已开启 🔔' : '提醒已关闭', icon: 'none' });
  },

  goPet(e) {
    wx.navigateTo({ url: '/pages/pet/detail/detail?id=' + e.currentTarget.dataset.id });
  },

  goPetFamily() {
    if (this.data.myPets && this.data.myPets.length) {
      wx.navigateTo({ url: '/pages/pet/detail/detail?id=' + this.data.myPets[0].id });
    } else {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  goKnowledge() { wx.navigateTo({ url: '/pages/knowledge/knowledge' }); },
  goNearby() { wx.navigateTo({ url: '/pages/nearby/nearby' }); },

  goCommunity() { wx.switchTab({ url: '/pages/community/community' }); },

  goAdd() { wx.navigateTo({ url: '/pages/pet/edit/edit' }); },

  goLogin() { wx.navigateTo({ url: '/pages/login/login' }); },

  editProfile() {
    if (!getApp().isLogin()) { this.goLogin(); return; }
    wx.navigateTo({ url: '/pages/profile/edit/edit' });
  },

  // 商家中心入口（未入驻则提示申请）
  goMerchant() {
    if (!getApp().ensureLogin('商家中心需要登录')) return;
    wx.navigateTo({ url: '/pages/shop/manage/manage' });
  },

  // 邀请好友加入宠物家庭
  inviteFamily() {
    if (!getApp().ensureLogin('邀请好友加入宠物家庭需要登录')) return;
    wx.showModal({
      title: '邀请加入宠物家庭',
      content: '把“宠物家庭邀请卡”分享给好友，对方加入后即可一起记录、共同守护毛孩子（每份档案最多 30 人）。',
      confirmText: '生成邀请卡',
      success: (r) => {
        if (r.confirm) {
          wx.showShareMenu({ withShareTicket: true });
          wx.showToast({ title: '已生成邀请卡，去分享吧 🐾', icon: 'none' });
        }
      }
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后仍可公开浏览，但评论、评分、协作记录等功能需重新登录。',
      confirmText: '退出',
      confirmColor: '#E4572E',
      success: (r) => {
        if (r.confirm) {
          getApp().logout();
          this.refresh();
          wx.showToast({ title: '已退出登录', icon: 'none' });
        }
      }
    });
  },

  about() {
    wx.showModal({
      title: '关于金喵宠物日记',
      content: '一款面向宠物爱好者与流浪动物救助者的记录小程序 v1.0.0（暖阳主题演示版）\n\n档案管理 · 成长记录 · 协作记录 · 轨迹 · 投喂 · 健康 · 社区 · 知识库 · 附近服务',
      showCancel: false
    });
  },

  onShareAppMessage() {
    return { title: '金喵宠物日记 · 一起记录毛孩子的成长', path: '/pages/index/index' };
  }
});

