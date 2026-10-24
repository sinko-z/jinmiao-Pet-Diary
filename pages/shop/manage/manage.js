const mock = require('../../../utils/mock.js');

Page({
  data: {
    login: false,
    app: null,          // 入驻申请记录
    shop: null,         // 审核通过后的店铺
    reviews: [],
    // 营业数据（演示）
    stats: { weekOrders: 42, weekIncome: '¥3,860', avgRating: 4.8, weekVisits: 318 },
    noticeSwitch: true
  },

  onShow() {
    const app = getApp();
    // 每次进入重置，避免退出登录后残留上一位商家的数据
    this.setData({ login: app.isLogin(), app: null, shop: null, reviews: [] });
    if (!app.isLogin()) return;
    // 读取入驻申请
    let merchant = null;
    try { merchant = wx.getStorageSync('merchantApp') || null; } catch (e) {}
    this.setData({ app: merchant });
    if (merchant && merchant.status === 'verified') {
      const shop = mock.shops.find(s => s.id === merchant.shopId) || null;
      if (shop) {
        const reviews = (mock.reviews[shop.id] || []).slice(0, 3).map(r => ({
          ...r,
          userFirst: r.user.slice(0, 1),
          fullArr: Array.from({ length: r.score }, () => 0),
          emptyArr: Array.from({ length: 5 - r.score }, () => 0)
        }));
        this.setData({ shop, reviews, 'stats.avgRating': shop.rating });
      }
    }
  },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/shop/index/index' });
  },

  goLogin() { wx.navigateTo({ url: '/pages/login/login' }); },
  goApply() { wx.redirectTo({ url: '/pages/shop/apply/apply' }); },
  goDetail() {
    if (this.data.shop) wx.navigateTo({ url: '/pages/shop/detail/detail?id=' + this.data.shop.id });
  },
  goNearby() { wx.navigateTo({ url: '/pages/nearby/nearby' }); },
  goIndex() { wx.switchTab({ url: '/pages/shop/index/index' }); },

  toggleNotice(e) {
    this.setData({ noticeSwitch: e.detail.value });
    wx.showToast({ title: e.detail.value ? '新订单提醒已开启 🔔' : '已关闭', icon: 'none' });
  },

  editShop() {
    wx.showToast({ title: '店铺资料编辑（演示）', icon: 'none' });
  },

  onShareAppMessage() {
    return { title: '金喵宠物日记 · 商家中心', path: '/pages/shop/manage/manage' };
  }
});
