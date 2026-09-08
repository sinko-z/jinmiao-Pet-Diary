const mock = require('../../utils/mock.js');

Page({
  data: {
    id: '',
    petOptions: [],
    petIndex: -1,
    form: {
      petId: '', time: '', contact: '', desc: '',
      lastPlace: '金桂小区·南门', lastAddress: '幸福路 88 号'
    },
    photo: '',
    submitting: false
  },

  onLoad(query) {
    const pets = mock.pets;
    const petOptions = pets.map(p => ({ id: p.id, label: `${p.emoji} ${p.name}（${p.species}）` }));
    let petIndex = -1;
    let form = this.data.form;
    if (query.id) {
      petIndex = pets.findIndex(p => p.id === query.id);
      if (petIndex >= 0) form = { ...form, petId: pets[petIndex].id, desc: `${pets[petIndex].name} 走失了，请帮忙留意！` };
    }
    const today = new Date();
    const pad = n => (n < 10 ? '0' + n : '' + n);
    form.time = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())} ${pad(today.getHours())}:${pad(today.getMinutes())}`;
    this.setData({ petOptions, petIndex, form });
  },

  onPetPick(e) {
    const idx = Number(e.detail.value);
    const pet = this.data.petOptions[idx];
    this.setData({
      petIndex: idx,
      form: { ...this.data.form, petId: pet.id, desc: `${pet.label.split(' ')[1]} 走失了，请帮忙留意！` }
    });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onTime(e) { this.setData({ 'form.time': e.detail.value }); },

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
    if (!f.contact.trim()) { wx.showToast({ title: '请填写联系方式', icon: 'none' }); return; }
    this.setData({ submitting: true });
    wx.showLoading({ title: '发布中…' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ submitting: false });
      wx.showModal({
        title: '发布成功 🐾',
        content: '走失信息已同步推送附近用户，并可分享至社区扩大传播。',
        confirmText: '分享到社区',
        cancelText: '知道了',
        success: (r) => {
          if (r.confirm) wx.navigateBack();
          else wx.navigateBack();
        }
      });
    }, 800);
  }
});
