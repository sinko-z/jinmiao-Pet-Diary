const mock = require('../../utils/mock.js');

Page({
  data: {
    keyword: '',
    filter: 'all',           // all / home / stray
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'home', label: '家养宠物' },
      { key: 'stray', label: '流浪救助' }
    ],
    pets: [],
    showSearch: false
  },

  onLoad() {
    this.setData({ pets: mock.pets });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  onPullDownRefresh() {
    this.applyFilter();
    wx.stopPullDownRefresh();
    wx.showToast({ title: '已刷新', icon: 'none' });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
    this.applyFilter();
  },

  onToggleSearch() {
    this.setData({ showSearch: !this.data.showSearch });
    if (!this.data.showSearch) {
      this.setData({ keyword: '' });
      this.applyFilter();
    }
  },

  onClearSearch() {
    this.setData({ keyword: '' });
    this.applyFilter();
  },

  onFilterTap(e) {
    this.setData({ filter: e.currentTarget.dataset.key });
    this.applyFilter();
  },

  applyFilter() {
    const kw = (this.data.keyword || '').trim().toLowerCase();
    let list = mock.pets.filter(p => {
      const okType = this.data.filter === 'all' || p.type === this.data.filter;
      const okKw = !kw ||
        p.name.toLowerCase().includes(kw) ||
        p.species.toLowerCase().includes(kw) ||
        p.tags.some(t => t.toLowerCase().includes(kw));
      return okType && okKw;
    });
    // 预计算成员头像首字（WXML 不支持表达式调方法，提前算好）
    list = list.map(p => ({
      ...p,
      members: (p.members || []).map(m => ({ ...m, firstChar: m.name.slice(0, 1), displayName: m.name.length > 3 ? m.name.slice(0, 3) + '…' : m.name })),
      moreCount: (p.members || []).length - 3
    }));
    this.setData({ pets: list });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/pet/detail/detail?id=' + id });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/pet/edit/edit' });
  },

  goNearbyPets() {
    wx.navigateTo({ url: '/pages/pet/nearby/nearby' });
  },

  goNearby() {
    wx.navigateTo({ url: '/pages/nearby/nearby' });
  },

  goLostPublish() {
    wx.navigateTo({ url: '/pages/lost/lost' });
  },

  onShareAppMessage() {
    return { title: '金喵宠物日记 · 记录每一只毛孩子的日常', path: '/pages/index/index' };
  }
});
