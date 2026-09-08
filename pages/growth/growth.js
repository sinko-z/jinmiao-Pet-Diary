const mock = require('../../utils/mock.js');
const util = require('../../utils/util.js');

Page({
  data: {
    id: '',
    petName: '',
    list: [],
    showUpload: false,
    uploadNote: ''
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    const raw = (mock.growths[id] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
    const list = raw.map(g => ({
      ...g,
      dateText: g.time.slice(0, 10),
      timeText: g.time.slice(11)
    }));
    this.setData({ id, petName: pet ? pet.name : '', list });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的成长记录' });
  },

  preview(e) {
    const url = e.currentTarget.dataset.url;
    if (url) wx.previewImage({ urls: [url] });
  },

  openUpload() { this.setData({ showUpload: true, uploadNote: '' }); },
  closeUpload() { this.setData({ showUpload: false }); },
  noop() {},
  onNote(e) { this.setData({ uploadNote: e.detail.value }); },

  submitUpload() {
    wx.showLoading({ title: '上传中…' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ showUpload: false });
      const now = new Date();
      const time = `${util.formatDate(now)} ${util.pad(now.getHours())}:${util.pad(now.getMinutes())}`;
      const item = {
        id: 'g' + Date.now(), petId: this.data.id, time,
        photo: '', note: this.data.uploadNote || '记录这一刻', location: '家里'
      };
      this.setData({ list: this.data.list.concat(item) });
      wx.showToast({ title: '记录成功 🎉', icon: 'none' });
    }, 600);
  }
});
