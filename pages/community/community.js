const mock = require('../../utils/mock.js');
const util = require('../../utils/util.js');

Page({
  data: {
    list: [],
    filterPet: '',         // 宠物筛选
    filterLabel: '🐾 全部动态',
    petOptions: [{ id: '', label: '全部动态' }],
    showComposer: false,
    composer: { text: '', images: [] },
    petFilterOptions: []
  },

  onLoad() {
    // 宠物筛选选项
    const opts = [{ id: '', label: '全部动态' }];
    mock.pets.forEach(p => opts.push({ id: p.id, label: p.emoji + ' ' + p.name }));
    this.setData({ petOptions: opts });
    this.refresh();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  onPullDownRefresh() {
    this.refresh();
    wx.stopPullDownRefresh();
    wx.showToast({ title: '已刷新', icon: 'none' });
  },

  refresh() {
    const list = mock.moments.slice().sort((a, b) => b.time.localeCompare(a.time)).map(m => ({
      ...m,
      timeText: util.fromNow(m.time),
      images: m.images || [],
      authorFirst: m.author.slice(0, 1)
    }));
    this.applyFilter(list);
  },

  applyFilter(list) {
    let out = list;
    if (this.data.filterPet) out = list.filter(m => m.petId === this.data.filterPet);
    this.setData({ list: out });
  },

  onPetFilter(e) {
    const idx = Number(e.detail.value);
    const opt = this.data.petOptions[idx];
    const label = opt.id ? ('只看：' + opt.label.split(' ')[1]) : '🐾 全部动态';
    this.setData({ filterPet: opt.id, filterLabel: label });
    this.applyFilter(this.data.list);
  },

  // 点赞
  onLike(e) {
    if (!getApp().ensureLogin('点赞需要登录')) return;
    const id = e.currentTarget.dataset.id;
    const list = this.data.list.map(m => {
      if (m.id === id) {
        const liked = !m.liked;
        return { ...m, liked, likes: m.likes + (liked ? 1 : -1) };
      }
      return m;
    });
    this.setData({ list });
  },

  // 查看 / 添加评论
  onComment(e) {
    if (!getApp().ensureLogin('评论需要登录')) return;
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '评论',
      editable: true,
      placeholderText: '友善评论，温暖每一个毛孩子',
      success: (r) => {
        if (r.confirm && r.content && r.content.trim()) {
          const list = this.data.list.map(m => {
            if (m.id === id) {
              return { ...m, comments: (m.comments || []).concat({ user: '我', text: r.content.trim() }) };
            }
            return m;
          });
          this.setData({ list });
          wx.showToast({ title: '评论成功', icon: 'none' });
        }
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({ urls: urls.split(','), current });
  },

  openComposer() {
    if (!getApp().ensureLogin('发布动态需要登录')) return;
    this.setData({ showComposer: true });
  },
  closeComposer() { this.setData({ showComposer: false }); },
  noop() {},
  onComposerText(e) { this.setData({ 'composer.text': e.detail.value }); },

  addImages() {
    const left = 9 - this.data.composer.images.length;
    if (left <= 0) return;
    wx.chooseMedia({
      count: left, mediaType: ['image'], sizeType: ['compressed'],
      success: (res) => {
        const images = this.data.composer.images.concat(res.tempFiles.map(f => f.tempFilePath));
        this.setData({ 'composer.images': images });
      }
    });
  },

  removeImage(e) {
    const idx = e.currentTarget.dataset.index;
    const images = this.data.composer.images.filter((_, i) => i !== idx);
    this.setData({ 'composer.images': images });
  },

  publish() {
    const text = this.data.composer.text.trim();
    if (!text && !this.data.composer.images.length) {
      wx.showToast({ title: '写点什么再发布吧', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '发布中…' });
    setTimeout(() => {
      wx.hideLoading();
      const now = new Date();
      const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const moment = {
        id: 'm' + Date.now(), petId: null, petName: null, petEmoji: '🐾',
        author: '我', authorFirst: '我', authorColor: '#F47521', time,
        text: text || '分享一张照片', images: this.data.composer.images,
        likes: 0, liked: false, comments: []
      };
      const list = [moment].concat(this.data.list);
      this.setData({ list, showComposer: false, composer: { text: '', images: [] } });
      wx.showToast({ title: '发布成功 🎉', icon: 'none' });
    }, 700);
  },


  onComposerPet(e) {
    const idx = Number(e.detail.value);
    const opt = this.data.petOptions[idx];
    this.setData({ composerPet: opt.id, composerPetLabel: opt.label });
  },

  onShare() {
    wx.showToast({ title: '已唤起分享面板', icon: 'none' });
    wx.showShareMenu();
  },
  onShareAppMessage() {
    return { title: '金喵宠物社区 · 和铲屎官们一起晒毛孩子', path: '/pages/community/community' };
  }
});


