const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    id: '',
    shop: null,
    reviews: [],
    showReview: false,
    reviewForm: { score: 5, text: '' },
    scoreOptions: [1, 2, 3, 4, 5],
    stars: { full: 0, half: 0, empty: 0 },
    rateStars: [true, true, true, true, true],
    myRated: false
  },

  onLoad(query) {
    const id = query.id || 's1';
    const shop = mock.shops.find(s => s.id === id);
    if (!shop) {
      wx.showToast({ title: '店铺不存在', icon: 'none' });
      setTimeout(() => this.goBack(), 600);
      return;
    }
    const reviews = (mock.reviews[id] || []).slice().sort((a, b) => b.time.localeCompare(a.time))
      .map(r => ({ ...r, timeText: util.fromNow(r.time), userFirst: r.user.slice(0, 1), stars: { full: r.score, empty: 5 - r.score } }));
    const full = Math.floor(shop.rating);
    const half = shop.rating - full >= 0.5 ? 1 : 0;
    this.setData({
      id, shop, reviews,
      stars: { full, half, empty: 5 - full - half }
    });
    wx.setNavigationBarTitle({ title: shop.name });
  },

  onShareAppMessage() {
    const s = this.data.shop;
    return s ? { title: `${s.name} · 评分 ${s.rating}，附近靠谱宠物服务`, path: '/pages/shop/detail/detail?id=' + s.id } : {};
  },

  // 返回上一页
  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/shop/index/index' });
  },

  call() {
    const s = this.data.shop;
    if (!s || !s.phone) { wx.showToast({ title: '该店铺无联系电话', icon: 'none' }); return; }
    wx.makePhoneCall({ phoneNumber: s.phone.replace(/\s/g, '') });
  },

  navigate() {
    const s = this.data.shop;
    wx.openLocation({ latitude: s.lat, longitude: s.lng, name: s.name, address: s.address, scale: 16 });
  },

  openReview() {
    if (!getApp().ensureLogin('给商家打分评价需要登录')) return;
    if (this.hasRated()) {
      this.setData({ myRated: true });
      wx.showToast({ title: '你已评价过该店铺', icon: 'none' });
      return;
    }
    this.setData({ showReview: true, reviewForm: { score: 5, text: '' } });
  },

  hasRated() {
    if (this.data.myRated) return true;
    const user = getApp().globalData.user;
    if (!user) return false;
    return (mock.reviews[this.data.id] || []).some(r => r.user === user.nickName);
  },
  closeReview() { this.setData({ showReview: false }); },
  noop() {},

  pickScore(e) {
    const score = Number(e.currentTarget.dataset.s);
    const rateStars = this.data.scoreOptions.map(i => i <= score);
    this.setData({ 'reviewForm.score': score, rateStars });
  },

  onText(e) { this.setData({ 'reviewForm.text': e.detail.value }); },

  submitReview() {
    if (this.hasRated()) { wx.showToast({ title: '你已评价过该店铺', icon: 'none' }); return; }
    const f = this.data.reviewForm;
    if (!f.text.trim()) { wx.showToast({ title: '写几句感受再提交吧', icon: 'none' }); return; }
    const user = getApp().globalData.user || { nickName: '我', avatarColor: '#F47521' };
    const now = new Date();
    const time = util.formatDate(now);
    const rev = {
      id: 'r' + Date.now(), user: user.nickName, userFirst: user.nickName.slice(0, 1), avatarColor: user.avatarColor,
      time, score: f.score,
      text: f.text.trim(),
      tags: f.score >= 4 ? ['好评'] : f.score <= 2 ? ['待改进'] : ['一般']
    };
    const reviews = [rev].concat(this.data.reviews);
    const shop = this.data.shop;
    const total = shop.rating * shop.scoreCount + f.score;
    const scoreCount = shop.scoreCount + 1;
    const rating = Math.round((total / scoreCount) * 10) / 10;
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;

    // 写回数据源：评价列表与店铺评分在返回后仍保留
    const bucket = mock.reviews[this.data.id] || (mock.reviews[this.data.id] = []);
    bucket.unshift({
      id: rev.id, user: rev.user, avatarColor: rev.avatarColor,
      time: rev.time, score: rev.score, text: rev.text, tags: rev.tags
    });
    Object.assign(shop, { rating, scoreCount });

    this.setData({
      reviews, showReview: false, myRated: true,
      shop: { ...shop, rating, scoreCount },
      stars: { full, half, empty: 5 - full - half }
    });
    wx.showToast({ title: '感谢评价 🐾', icon: 'success' });
  }
});
