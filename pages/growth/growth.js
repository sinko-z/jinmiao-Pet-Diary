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
    petName: '',
    list: [],
    showUpload: false,
    uploadNote: '',
    uploadPhoto: '',
    uploadLocation: '家里'
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    this.setData({ id, petName: pet ? pet.name : '' });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的成长记录' });
    this.refresh();
  },

  // 从数据源读取并格式化列表
  refresh() {
    const raw = (mock.growths[this.data.id] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
    const list = raw.map(g => ({
      ...g,
      dateText: g.time.slice(0, 10),
      timeText: g.time.slice(11)
    }));
    this.setData({ list });
  },

  preview(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;
    // 预览当前记录所在宠物相册中的全部照片
    const urls = this.data.list.filter(g => g.photo).map(g => g.photo);
    wx.previewImage({ urls: urls.length ? urls : [url], current: url });
  },

  openUpload() {
    this.setData({ showUpload: true, uploadNote: '', uploadPhoto: '', uploadLocation: '家里' });
  },
  closeUpload() { this.setData({ showUpload: false }); },
  noop() {},
  onNote(e) { this.setData({ uploadNote: e.detail.value }); },

  // 选择照片（原功能只保存了文字，这里补上真实图片）
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        if (file) this.setData({ uploadPhoto: file.tempFilePath });
      }
    });
  },

  // 选择地点（原功能固定为“家里”）
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        const name = res.name || res.address;
        if (name) this.setData({ uploadLocation: name });
      },
      fail: () => {
        // 用户取消或无定位权限时保持原地点，不打断上传
      }
    });
  },

  removePhoto() {
    this.setData({ uploadPhoto: '' });
  },

  submitUpload() {
    const note = (this.data.uploadNote || '').trim();
    if (!note && !this.data.uploadPhoto) {
      wx.showToast({ title: '写点备注或选张照片吧', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '上传中…' });
    setTimeout(() => {
      wx.hideLoading();
      const now = new Date();
      const item = {
        id: 'g' + Date.now(),
        petId: this.data.id,
        time: util.formatDateTime(now),
        photo: this.data.uploadPhoto,
        note: note || '记录这一刻',
        location: this.data.uploadLocation || '家里'
      };
      // 写入数据源，离开页面后再进入不会丢失
      const store = mock.growths[this.data.id] = mock.growths[this.data.id] || [];
      store.push(item);
      store.sort((a, b) => a.time.localeCompare(b.time));
      this.setData({ showUpload: false, uploadNote: '', uploadPhoto: '', uploadLocation: '家里' });
      this.refresh();
      wx.showToast({ title: '记录成功 🎉', icon: 'none' });
    }, 600);
  }
});
