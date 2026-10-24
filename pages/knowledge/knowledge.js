const mock = require('../../utils/mock.js');

Page({
  // 返回上一页（兼容从分享/扫码直接进入的情况）
  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/index/index' });
  },

  data: {
    cats: [],
    cat: '全部',
    keyword: '',
    list: [],
    collectedOnly: false
  },

  onLoad() {
    const cats = ['全部', '科学喂养', '常见疾病护理', '行为训练', '宠物用品推荐'];
    this.setData({ cats });
    this.apply();
  },

  onCat(e) {
    this.setData({ cat: e.currentTarget.dataset.cat });
    this.apply();
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.apply();
  },

  toggleCollectedOnly() {
    this.setData({ collectedOnly: !this.data.collectedOnly });
    this.apply();
  },

  apply() {
    const kw = this.data.keyword.trim();
    let list = mock.knowledge.filter(k => {
      const okCat = this.data.cat === '全部' || k.category === this.data.cat;
      const okKw = !kw || k.title.includes(kw) || k.summary.includes(kw) || k.tags.some(t => t.includes(kw));
      const okCol = !this.data.collectedOnly || k.collected;
      return okCat && okKw && okCol;
    });
    // 阅读数文案（WXML 中不支持 (a/b).toFixed() 写法，故预计算）
    list = list.map(k => ({
      ...k,
      readText: k.read >= 10000 ? (k.read / 10000).toFixed(1) + 'w' : String(k.read)
    }));
    this.setData({ list });
  },

  toggleCollect(e) {
    const id = e.currentTarget.dataset.id;
    const item = mock.knowledge.find(k => k.id === id);
    if (!item) return;
    // 写回数据源，收藏状态在切页后仍保留
    item.collected = !item.collected;
    this.apply();
    wx.showToast({ title: item.collected ? '已收藏' : '已取消收藏', icon: 'none' });
  },

  openArticle(e) {
    const { id, title } = e.currentTarget.dataset;
    const item = mock.knowledge.find(k => k.id === id);
    if (!item) return;
    // 阅读数 +1 并保留
    item.read = (item.read || 0) + 1;
    this.apply();
    wx.showModal({
      title,
      content: item.content || '文章正文内容将在此展示（演示版仅预览）。可收藏本文，方便日后阅读。',
      confirmText: item.collected ? '已收藏' : '收藏',
      cancelText: '关闭',
      success: (r) => {
        if (r.confirm && !item.collected) this.toggleCollect({ currentTarget: { dataset: { id } } });
      }
    });
  }
});
