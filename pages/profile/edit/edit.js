Page({
  data: {
    user: null,
    colors: ['#FF9F4A', '#F47521', '#E4572E', '#F2B04C', '#7BA05B', '#E8A13C'],
    nickName: '',
    bio: ''
  },

  onShow() {
    const app = getApp();
    if (!app.isLogin()) {
      wx.showModal({
        title: '需要登录',
        content: '编辑个人资料前请先登录',
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }
    const u = app.globalData.user;
    this.setData({ user: Object.assign({}, u, { firstChar: u.nickName.slice(0, 1) }), nickName: u.nickName, bio: u.bio || '' });
  },

  onNick(e) { this.setData({ nickName: e.detail.value }); },
  onBio(e) { this.setData({ bio: e.detail.value }); },
  pickColor(e) { this.setData({ 'user.avatarColor': e.currentTarget.dataset.color }); },

  save() {
    const app = getApp();
    const nick = this.data.nickName.trim();
    if (!nick) { wx.showToast({ title: '昵称不能为空', icon: 'none' }); return; }
    app.updateUser({ nickName: nick, bio: this.data.bio.trim(), avatarColor: this.data.user.avatarColor });
    wx.showToast({ title: '资料已更新 🎉', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
