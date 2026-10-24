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
    composerPet: '',
    composerPetLabel: '🐾 关联宠物（可选）'
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
    // 其他页面发布走失/动态后回到社区时同步
    this.refresh();
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
      comments: m.comments || [],
      authorFirst: (m.author || '🐾').slice(0, 1)
    }));
    // 保留完整列表，筛选时始终基于全量数据，避免二次筛选叠加
    this.rawList = list;
    this.applyFilter();
  },

  applyFilter() {
    const all = this.rawList || [];
    const out = this.data.filterPet ? all.filter(m => m.petId === this.data.filterPet) : all;
    this.setData({ list: out });
  },

  onPetFilter(e) {
    const idx = Number(e.detail.value);
    const opt = this.data.petOptions[idx];
    if (!opt) return;
    this.setData({
      filterPet: opt.id,
      filterLabel: opt.id ? ('只看：' + opt.label) : '🐾 全部动态'
    });
    this.applyFilter();
  },

  // 点赞（同步到数据源，切页刷新后仍保留）
  onLike(e) {
    if (!getApp().ensureLogin('点赞需要登录')) return;
    const id = e.currentTarget.dataset.id;
    const src = mock.moments.find(m => m.id === id);
    if (!src) return;
    src.liked = !src.liked;
    src.likes = Math.max(0, (src.likes || 0) + (src.liked ? 1 : -1));
    const list = this.data.list.map(m => m.id === id ? { ...m, liked: src.liked, likes: src.likes } : m);
    if (this.rawList) this.rawList = this.rawList.map(m => m.id === id ? { ...m, liked: src.liked, likes: src.likes } : m);
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
        if (!r.confirm || !r.content || !r.content.trim()) return;
        const text = r.content.trim();
        const src = mock.moments.find(m => m.id === id);
        if (src) src.comments = (src.comments || []).concat({ user: '我', text });
        const list = this.data.list.map(m => m.id === id
          ? { ...m, comments: (m.comments || []).concat({ user: '我', text }) }
          : m);
        if (this.rawList) this.rawList = this.rawList.map(m => m.id === id
          ? { ...m, comments: (m.comments || []).concat({ user: '我', text }) }
          : m);
        this.setData({ list });
        wx.showToast({ title: '评论成功', icon: 'none' });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    if (!urls) return;
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
    const user = getApp().globalData.user;
    const pet = mock.pets.find(p => p.id === this.data.composerPet);
    wx.showLoading({ title: '发布中…' });
    setTimeout(() => {
      wx.hideLoading();
      const moment = {
        id: 'm' + Date.now(),
        petId: pet ? pet.id : null,
        petName: pet ? pet.name : null,
        petEmoji: pet ? pet.emoji : '🐾',
        author: (user && user.nickName) || '我',
        authorColor: (user && user.avatarColor) || '#F47521',
        time: util.formatDateTime(new Date()),
        text: text || '分享一张照片',
        images: this.data.composer.images,
        likes: 0, liked: false, comments: []
      };
      // 写入数据源，刷新/切页后不会丢失
      mock.moments.unshift(moment);
      this.setData({
        showComposer: false,
        composer: { text: '', images: [] },
        composerPet: '',
        composerPetLabel: '🐾 关联宠物（可选）',
        filterPet: '',
        filterLabel: '🐾 全部动态'
      });
      this.refresh();
      wx.showToast({ title: '发布成功 🎉', icon: 'none' });
    }, 700);
  },

  onComposerPet(e) {
    const idx = Number(e.detail.value);
    const opt = this.data.petOptions[idx];
    if (!opt) return;
    this.setData({
      composerPet: opt.id,
      composerPetLabel: opt.id ? ('🐾 ' + opt.label.split(' ').slice(1).join(' ')) : '🐾 关联宠物（可选）'
    });
  },

  onShareAppMessage() {
    return { title: '金喵宠物社区 · 和铲屎官们一起晒毛孩子', path: '/pages/community/community' };
  }
});
