const mock = require('../../utils/mock.js');

Page({
  data: {
    avatarColor: '#FF9F4A',
    colors: ['#FF9F4A', '#F47521', '#E4572E', '#F2B04C', '#7BA05B', '#E8A13C'],
    agree: true,
    userPreview: '我'
  },

  chooseColor(e) {
    this.setData({ avatarColor: e.currentTarget.dataset.color });
  },

  toggleAgree() {
    this.setData({ agree: !this.data.agree });
  },

  onLogin() {
    if (!this.data.agree) {
      wx.showToast({ title: '请先阅读并同意用户协议', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '微信登录中…' });
    const app = getApp();
    app.login((user) => {
      // 演示：登录成功后自动把“我”加入各宠物家庭（便于演示协作/邀请）
      setTimeout(() => {
        wx.hideLoading();
        user.avatarColor = this.data.avatarColor;
        app.updateUser({ avatarColor: this.data.avatarColor });
        wx.showToast({ title: '登录成功 🎉', icon: 'success' });
        setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) }), 600);
      }, 600);
    });
  },

  onProtocol() {
    wx.showModal({
      title: '用户协议与隐私政策',
      content: '登录即代表同意：\n1. 使用微信账号授权登录；\n2. 宠物档案公开可见，个人联系方式仅协作者可见；\n3. 商家入驻需提交营业执照与身份信息用于审核。',
      showCancel: false
    });
  }
});
