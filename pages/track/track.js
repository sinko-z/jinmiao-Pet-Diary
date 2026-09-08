const mock = require('../../utils/mock.js');

Page({
  data: {
    id: '',
    petName: '',
    view: 'timeline',       // timeline / map / heat
    list: [],
    markers: [],
    polyline: [],
    center: { latitude: 31.2304, longitude: 121.4737 },
    dateFilter: '全部',
    dateOptions: ['全部', '近7天', '近30天', '自定义'],
    note: '',
    heatCells: []
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    const list = mock.tracks[id] || [];
    this.setData({ id, petName: pet ? pet.name : '', list });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的活动轨迹' });
    this.buildMarkers(list);
    this.buildHeat(list);
  },

  buildMarkers(list) {
    const markers = list.map((t, i) => ({
      id: i + 1,
      latitude: t.lat,
      longitude: t.lng,
      width: 26,
      height: 34,
      callout: {
        content: t.location + (t.note ? ' · ' + t.note : ''),
        color: '#6E4224', fontSize: 11, borderRadius: 8,
        bgColor: '#FFF6EC', padding: 6, display: 'BYCLICK', textAlign: 'center'
      }
    }));
    // 使用 iconPath 需要真实图片，这里用默认标记位置演示
    const polyline = [{
      points: list.map(t => ({ latitude: t.lat, longitude: t.lng })),
      color: '#F47521AA', width: 5, arrowLine: true, borderColor: '#FFFFFF', borderWidth: 1
    }];
    const center = list.length ? { latitude: list[0].lat, longitude: list[0].lng } : this.data.center;
    this.setData({ markers, polyline, center });
  },

  buildHeat(list) {
    // 演示热力：按点聚类成暖色强度格
    const cells = [];
    const seed = [
      { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 0 },
      { r: 1, c: 3 }, { r: 3, c: 2 }, { r: 2, c: 2 }, { r: 0, c: 3 }
    ];
    seed.forEach((s, i) => {
      cells.push({
        id: 'hc' + i,
        r: s.r, c: s.c,
        hot: i < list.length,
        strength: Math.min(0.95, 0.3 + (i % 4) * 0.18)
      });
    });
    this.setData({ heatCells: cells });
  },

  switchView(e) {
    this.setData({ view: e.currentTarget.dataset.view });
  },

  onDateChange(e) {
    this.setData({ dateFilter: this.data.dateOptions[e.detail.value] });
  },

  // 定位打卡（通过统一授权工具调用手机定位，并征得用户同意）
  checkin() {
    wx.showModal({
      title: '定位打卡',
      content: '将获取你的当前位置，用于记录「' + this.data.petName + '」本次打卡地点。允许使用位置信息吗？',
      confirmText: '允许定位',
      cancelText: '暂不',
      confirmColor: '#F47521',
      success: (r) => {
        if (!r.confirm) return;
        getApp().getLocation((res) => {
          if (res.status !== 'ok') return; // 拒绝/失败已由工具引导
          const now = new Date();
          const pad = n => (n < 10 ? '0' + n : '' + n);
          const item = {
            id: 't' + Date.now(),
            time: now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()),
            location: '当前位置', address: '经度 ' + res.lng.toFixed(5) + '，纬度 ' + res.lat.toFixed(5),
            lat: res.lat, lng: res.lng,
            note: this.data.note || '在这里玩了一会儿', type: 'play'
          };
          const list = [item].concat(this.data.list);
          this.setData({ list, note: '' });
          this.buildMarkers(list);
          wx.showToast({ title: '打卡成功 🐾', icon: 'none' });
        });
      }
    });
  },

  onNote(e) { this.setData({ note: e.detail.value }); },

  // 地图选点打卡
  chooseOnMap() {
    wx.chooseLocation({
      success: (res) => {
        const now = new Date();
        const item = {
          id: 't' + Date.now(),
          time: `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`,
          location: res.name || '地图选点', address: res.address || '',
          lat: res.latitude, lng: res.longitude,
          note: this.data.note || '手动打卡', type: 'play'
        };
        const list = [item].concat(this.data.list);
        this.setData({ list, note: '' });
        this.buildMarkers(list);
        wx.showToast({ title: '打卡成功 🐾', icon: 'none' });
      },
      fail: () => {}
    });
  }
});
