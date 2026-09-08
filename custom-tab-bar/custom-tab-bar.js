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
      const { index, path } = e.currentTarget.dataset;
      if (index === this.data.selected) return;
      wx.switchTab({ url: path });
    }
  }
});
