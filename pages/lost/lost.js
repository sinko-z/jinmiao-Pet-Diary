const mock = require('../../utils/mock.js');
const util = require('../../utils/util.js');

Page({
  // 返回上一页（兼容从分享/扫码直接进入的情况）
  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/index/index' });
  },

  data: {
    id: '',
    petOptions: [],
    petIndex: -1,
    form: {
      petId: '', time: '', clock: '08:00', contact: '', desc: '',
      lastPlace: '金桂小区·南门', lastAddress: '幸福路 88 号'
    },
    photo: '',
    submitting: false
  },

  onLoad(query) {
    const pets = mock.pets;
    const petOptions = pets.map(p => ({ id: p.id, name: p.name, label: `${p.emoji} ${p.name}（${p.species}）` }));
    let petIndex = -1;
    let form = this.data.form;
    if (query.id) {
      petIndex = pets.findIndex(p => p.id === query.id);
      if (petIndex >= 0) form = { ...form, petId: pets[petIndex].id, desc: `${pets[petIndex].name} 走失了，请帮忙留意！` };
    }
    const today = new Date();
    const pad = n => (n < 10 ? '0' + n : '' + n);
    // date picker 只接受 YYYY-MM-DD，时间单独用 time picker
    form.time = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    form.clock = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
    this.setData({ petOptions, petIndex, form });
  },

  onPetPick(e) {
    const idx = Number(e.detail.value);
    const pet = this.data.petOptions[idx];
    if (!pet) return;
    this.setData({
      petIndex: idx,
      form: { ...this.data.form, petId: pet.id, desc: `${pet.name} 走失了，请帮忙留意！` }
    });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onTime(e) { this.setData({ 'form.time': e.detail.value }); },
  onClock(e) { this.setData({ 'form.clock': e.detail.value }); },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.lastPlace': res.name || '选点位置',
          'form.lastAddress': res.address || `${res.latitude}, ${res.longitude}`
        });
      },
      fail: () => {}
    });
  },

  choosePhoto() {
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sizeType: ['compressed'],
      success: (res) => this.setData({ photo: res.tempFiles[0].tempFilePath })
    });
  },

  publish() {
    const f = this.data.form;
    if (!f.petId) { wx.showToast({ title: '请选择走失宠物', icon: 'none' }); return; }
    if (!f.time) { wx.showToast({ title: '请选择走失日期', icon: 'none' }); return; }
    if (!f.contact.trim()) { wx.showToast({ title: '请填写联系方式', icon: 'none' }); return; }
    if (!getApp().ensureLogin('发布走失信息需要登录')) return;

    const pet = mock.pets.find(p => p.id === f.petId);
    if (!pet) { wx.showToast({ title: '宠物档案不存在', icon: 'none' }); return; }

    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中…' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ submitting: false });

      // 标记档案为走失状态
      pet.lost = true;

      // 同步一条走失动态到社区，扩大传播
      const user = getApp().globalData.user || {};
      const moment = {
        id: 'm' + Date.now(),
        petId: pet.id,
        petName: pet.name,
        petEmoji: pet.emoji,
        author: user.nickName || '我',
        authorColor: user.avatarColor || '#F47521',
        time: util.formatDateTime(new Date()),
        text: `【走失寻宠】${pet.name} 于 ${f.time} ${f.clock} 在${f.lastPlace}走失。${f.desc || ''} 如有线索请联系：${f.contact}`,
        images: this.data.photo ? [this.data.photo] : [],
        likes: 0, liked: false, comments: []
      };
      mock.moments.unshift(moment);

      wx.showModal({
        title: '发布成功 🐾',
        content: '走失信息已同步推送附近用户，并已生成社区动态，可进一步分享扩大传播。',
        confirmText: '去社区看看',
        cancelText: '返回',
        success: (r) => {
          if (r.confirm) wx.switchTab({ url: '/pages/community/community' });
          else this.goBack();
        }
      });
    }, 800);
  }
});
