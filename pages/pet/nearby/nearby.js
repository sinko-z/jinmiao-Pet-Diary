const mock = require('../../../utils/mock.js');

Page({
  data: {
    list: [],
    view: 'list',          // list / map
    filter: 'all',         // all / stray / home
    filters: [
      { key: 'all', label: '全部' },
      { key: 'stray', label: '流浪救助' },
      { key: 'home', label: '家养宠物' }
    ],
    locating: true,
    markers: [],
    center: { latitude: 31.2304, longitude: 121.4737 }
  },

  onLoad() {
    this.apply();
    this.locate();
  },

  locate() {
    // 统一授权定位：征得用户同意后调用手机定位
    getApp().getLocation((res) => {
      if (res.status === 'ok') {
        this.setData({ locating: false, located: true });
        this.apply();
      } else {
        this.setData({ locating: false, located: false });
        this.apply(); // 仍展示示例数据并提示
        if (res.status === 'deny') {
          wx.showToast({ title: '未开启定位，展示示例位置', icon: 'none' });
        }
      }
    });
  },

  onFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.key });
    this.apply();
  },

  // 隐私政策说明
  onPrivacy() {
    wx.showModal({
      title: '位置信息与隐私',
      content: '1. 仅在你看“附近的宠物”并授权后，我们才会调用手机定位；\n2. 定位仅用于计算距离与展示附近宠物，不会上传或公开你的精确位置；\n3. 宠物打卡地点可选择展示为“小区/公园”等模糊位置；\n4. 你可以随时在“设置-位置信息”中关闭授权。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#F47521'
    });
  },

  switchView(e) {
    this.setData({ view: e.currentTarget.dataset.view });
    if (e.currentTarget.dataset.view === 'map') this.buildMarkers(this.data.list);
  },

  apply() {
    let list = mock.nearbyPets.filter(p => this.data.filter === 'all' || p.typeText === (this.data.filter === 'stray' ? '流浪救助' : '家养宠物'));
    list = list.slice().sort((a, b) => this.parseDist(a.distance) - this.parseDist(b.distance));
    this.setData({ list });
    if (this.data.view === 'map') this.buildMarkers(list);
  },

  parseDist(s) {
    if (!s) return 99999;
    return parseFloat(s) * (s.includes('km') ? 1000 : 1);
  },

  buildMarkers(list) {
    const markers = list.map((p, i) => ({
      id: i + 1,
      latitude: p.lat,
      longitude: p.lng,
      width: 28,
      height: 36,
      callout: {
        content: `${p.emoji} ${p.name}（${p.typeText}）`,
        color: '#6E4224', fontSize: 11, borderRadius: 8,
        bgColor: '#FFF6EC', padding: 6, display: 'BYCLICK', textAlign: 'center'
      }
    }));
    const center = list.length ? { latitude: list[0].lat, longitude: list[0].lng } : this.data.center;
    this.setData({ markers, center });
  },

  // 查看宠物详情（有档案则跳档案，否则本地详情弹层）
  viewPet(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '查看附近宠物',
      content: '完整档案与“加为好朋友”功能演示（真实环境跳转对应宠物档案）。',
      confirmText: '查看档案',
      cancelText: '关闭',
      success: (r) => { if (r.confirm) wx.navigateTo({ url: '/pages/pet/detail/detail?id=p1' }); }
    });
  },

  // 添加为好朋友（可对应“宠物好朋友”关系）
  addFriend(e) {
    const id = e.currentTarget.dataset.id;
    const pet = mock.nearbyPets.find(p => p.id === id);
    wx.showToast({ title: `已向 ${pet.name} 的主人发送交友申请 🐾`, icon: 'none' });
  },

  onShareAppMessage() {
    return { title: '附近的宠物 · 看看周围都有哪些毛孩子', path: '/pages/pet/nearby/nearby' };
  }
});
