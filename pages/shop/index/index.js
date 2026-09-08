const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    shops: [],
    cats: [
      { key: 'all', label: '全部' },
      { key: '宠物医院', label: '🏥 医院' },
      { key: '宠物店', label: '🛍️ 宠物店' }
    ],
    cat: 'all',
    sort: 'distance',
    locating: true,
    myShop: null        // 我入驻的店铺（演示：申请通过后可见）
  },

  onLoad() {
    this.loadMyShop();
    this.setData({ shops: mock.shops });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.loadMyShop();
    this.apply();
    this.locate();
  },

  loadMyShop() {
    // 演示：本地缓存中若存在审核通过的店铺则展示
    let myShop = null;
    try {
      const app = wx.getStorageSync('merchantApp');
      if (app && app.status === 'verified') {
        myShop = mock.shops.find(s => s.id === app.shopId) || null;
      }
    } catch (e) {}
    this.setData({ myShop });
  },

  locate() {
    getApp().getLocation((res) => {
      this.setData({ locating: false });
      if (res.status === 'deny') wx.showToast({ title: '未开启定位，展示示例距离', icon: 'none' });
    });
  },

  apply() {
    let list = mock.shops.filter(s => this.data.cat === 'all' || s.category === this.data.cat);
    list = list.slice().sort((a, b) => {
      if (this.data.sort === 'rating') return b.rating - a.rating;
      return this.parseDist(a.distance) - this.parseDist(b.distance);
    });
    list = list.map(s => ({ ...s, ratingStars: this.stars(s.rating) }));
    this.setData({ shops: list });
  },

  stars(r) {
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    return { full, half, empty: 5 - full - half };
  },

  parseDist(s) {
    if (!s) return 99999;
    return parseFloat(s) * (s.includes('km') ? 1000 : 1);
  },

  onCat(e) { this.setData({ cat: e.currentTarget.dataset.key }); this.apply(); },
  onSort(e) { this.setData({ sort: e.currentTarget.dataset.sort }); this.apply(); },

  onPullDownRefresh() {
    this.apply(); this.locate();
    wx.stopPullDownRefresh();
    wx.showToast({ title: '已刷新', icon: 'none' });
  },

  goShop(e) {
    wx.navigateTo({ url: '/pages/shop/detail/detail?id=' + e.currentTarget.dataset.id });
  },

  goApply() {
    // 登录校验：入驻需登录
    if (!getApp().ensureLogin('商家入驻需要登录')) return;
    wx.navigateTo({ url: '/pages/shop/apply/apply' });
  },

  goMyShop() {
    if (this.data.myShop) {
      wx.navigateTo({ url: '/pages/shop/manage/manage' });
    }
  },

  onShareAppMessage() {
    return { title: '金喵宠物店 · 附近靠谱的宠物服务都在这', path: '/pages/shop/index/index' };
  }
});
