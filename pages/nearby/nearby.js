const mock = require('../../utils/mock.js');

Page({
  data: {
    list: [],
    types: [
      { key: 'all', label: '全部' },
      { key: '宠物医院', label: '🏥 医院' },
      { key: '宠物店', label: '🛍️ 宠物店' },
      { key: '宠物公园', label: '🌳 公园' }
    ],
    type: 'all',
    sort: 'distance',       // distance / rating
    locating: true
  },

  onLoad() {
    this.setData({ list: mock.nearby });
    this.locate();
  },

  locate() {
    getApp().getLocation((res) => {
      this.setData({ locating: false });
      if (res.status === 'deny') wx.showToast({ title: '未开启定位，展示示例位置', icon: 'none' });
      // 按距离重排（真实场景按 res.lat/lng 计算真实距离）
      const list = mock.nearby.slice().sort((a, b) => this.parseDist(a.distance) - this.parseDist(b.distance));
      this.setData({ list });
    });
  },

  parseDist(s) {
    if (!s) return 99999;
    return parseFloat(s) * (s.includes('km') ? 1000 : 1);
  },

  goNearbyPets() { wx.navigateTo({ url: '/pages/pet/nearby/nearby' }); },
  goShopTab() { wx.switchTab({ url: '/pages/shop/index/index' }); },

  onType(e) {
    this.setData({ type: e.currentTarget.dataset.key });
    this.apply();
  },

  onSort(e) {
    this.setData({ sort: e.currentTarget.dataset.sort });
    this.apply();
  },

  apply() {
    let list = mock.nearby.filter(n => this.data.type === 'all' || n.type === this.data.type);
    list = list.slice().sort((a, b) => {
      if (this.data.sort === 'rating') return b.rating - a.rating;
      return this.parseDist(a.distance) - this.parseDist(b.distance);
    });
    this.setData({ list });
  },

  call(e) {
    const phone = e.currentTarget.dataset.phone;
    if (!phone) { wx.showToast({ title: '该地点无联系电话', icon: 'none' }); return; }
    wx.makePhoneCall({ phoneNumber: phone.replace(/\s/g, '') });
  },

  navigate(e) {
    const { lat, lng, name } = e.currentTarget.dataset;
    wx.openLocation({ latitude: Number(lat), longitude: Number(lng), name, scale: 16 });
  }
});
