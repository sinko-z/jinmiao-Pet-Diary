// custom-tab-bar/index.js —— 暖色自定义底部导航（4 个 tab）
Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '首页', icon: '🏠' },
      { pagePath: '/pages/community/community', text: '社区', icon: '💬' },
      { pagePath: '/pages/shop/index/index', text: '宠物店', icon: '🏪' },
      { pagePath: '/pages/mine/mine', text: '我的', icon: '🧡' }
    ]
  },
  methods: {
    switchTab(e) {
      const index = Number(e.currentTarget.dataset.index);
      const path = e.currentTarget.dataset.path;
      if (!path || index === this.data.selected) return;
      // 先更新高亮，再切换页面（目标页 onShow 会再次校准 selected）
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    }
  }
});
