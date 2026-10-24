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
    view: 'timeline',       // timeline / map / heat
    list: [],
    markers: [],
    polyline: [],
    center: { latitude: 31.2304, longitude: 121.4737 },
    dateFilter: '全部',
    dateIndex: 0,
    dateOptions: ['全部'],
    note: '',
    heatCells: []
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    this.setData({ id, petName: pet ? pet.name : '' });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的活动轨迹' });
    // 全量轨迹（按时间升序，用于地图连线）
    this.all = (mock.tracks[id] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
    this.buildDateOptions();
    this.refresh();
  },

  // 用现有数据中的月份生成筛选项（数据没有真实近 30 天时依然可用）
  buildDateOptions() {
    const months = [];
    this.all.forEach(t => {
      const m = t.time.slice(0, 7);
      if (months.indexOf(m) < 0) months.push(m);
    });
    months.sort((a, b) => b.localeCompare(a));
    this.setData({ dateOptions: ['全部'].concat(months), dateFilter: '全部', dateIndex: 0 });
  },

  refresh() {
    const f = this.data.dateFilter;
    const filtered = f === '全部' ? this.all.slice() : this.all.filter(t => t.time.slice(0, 7) === f);
    // 时间线新→旧，地图连线旧→新
    const list = filtered.slice().reverse();
    this.setData({ list });
    this.buildMarkers(filtered);
    this.buildHeat(filtered);
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
    // 至少两个点才能连线，单点时不渲染 polyline
    const polyline = list.length > 1 ? [{
      points: list.map(t => ({ latitude: t.lat, longitude: t.lng })),
      color: '#F47521AA', width: 5, arrowLine: true, borderColor: '#FFFFFF', borderWidth: 1
    }] : [];
    const center = list.length ? { latitude: list[list.length - 1].lat, longitude: list[list.length - 1].lng } : this.data.center;
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
    const idx = Number(e.detail.value);
    const filter = this.data.dateOptions[idx] || '全部';
    this.setData({ dateFilter: filter, dateIndex: idx });
    this.refresh();
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
          const item = {
            id: 't' + Date.now(),
            time: util.formatDateTime(new Date()),
            location: '当前位置',
            address: '经度 ' + res.lng.toFixed(5) + '，纬度 ' + res.lat.toFixed(5),
            lat: res.lat, lng: res.lng,
            note: this.data.note || '在这里玩了一会儿',
            type: 'play'
          };
          this.addTrack(item);
        });
      }
    });
  },

  onNote(e) { this.setData({ note: e.detail.value }); },

  // 地图选点打卡
  chooseOnMap() {
    wx.chooseLocation({
      success: (res) => {
        const item = {
          id: 't' + Date.now(),
          time: util.formatDateTime(new Date()),
          location: res.name || '地图选点',
          address: res.address || '',
          lat: res.latitude, lng: res.longitude,
          note: this.data.note || '手动打卡',
          type: 'play'
        };
        this.addTrack(item);
      },
      fail: () => {}
    });
  },

  // 写入数据源并刷新（离开页面后再进入不会丢失）
  addTrack(item) {
    this.all.push(item);
    this.all.sort((a, b) => a.time.localeCompare(b.time));
    const store = mock.tracks[this.data.id] = mock.tracks[this.data.id] || [];
    store.push(item);
    store.sort((a, b) => a.time.localeCompare(b.time));
    // 新增月份时重置筛选，确保刚打的卡可见
    this.buildDateOptions();
    this.setData({ note: '' });
    this.refresh();
    wx.showToast({ title: '打卡成功 🐾', icon: 'none' });
  }
});
