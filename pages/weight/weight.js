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
    range: '3m',
    ranges: [
      { key: '3m', label: '近3个月' },
      { key: '6m', label: '近半年' },
      { key: 'all', label: '全部' }
    ],
    records: [],          // 当前区间
    allRecords: [],
    latest: null,
    trend: { level: 'normal', text: '数据太少', diff: 0 },
    showForm: false,
    form: { weight: '', date: '' },
    chartW: 640,
    chartH: 420
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    const all = (mock.weights[id] || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    this.setData({ id, petName: pet ? pet.name : '', allRecords: all });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的体重' });
  },

  onReady() {
    // 旧版 Canvas 的绘制坐标单位是 px，必须按屏幕宽度把 640rpx 换算成 px
    const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const ratio = (info.windowWidth || 375) / 750;
    this.chartRatio = ratio;
    const chartW = Math.round(640 * ratio);
    const chartH = Math.round(420 * ratio);
    this.setData({ chartW, chartH }, () => this.applyRange(this.data.range));
  },

  // 切换时间段
  onRange(e) {
    const key = e.currentTarget.dataset.key;
    this.applyRange(key);
  },

  applyRange(key) {
    const all = this.data.allRecords;
    const now = new Date();
    let records = all;
    if (key !== 'all') {
      const months = key === '3m' ? 3 : 6;
      const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
      records = all.filter(r => {
        const d = util.toDate(r.date);
        return d && d >= cutoff;
      });
    }
    if (!records.length && all.length) records = [all[all.length - 1]];
    const latest = records.length ? records[records.length - 1] : null;
    const trend = util.weightTrend(records);
    // 计算环比差值用于列表展示
    records = records.map((r, i) => {
      const base = {
        ...r,
        dayText: r.date.slice(8, 10),
        monthText: r.date.slice(0, 7)
      };
      if (i === 0) return { ...base, diffText: '', diffDown: false };
      const d = r.weight - records[i - 1].weight;
      return {
        ...base,
        diffText: (d >= 0 ? '▲ +' : '▼ ') + Math.abs(d).toFixed(1),
        diffDown: d < 0
      };
    });
    this.setData({ range: key, records, latest, trend }, () => this.drawChart());
  },

  // 体重预警提示
  showWarn() {
    const t = this.data.trend;
    if (t.level === 'danger') {
      wx.showModal({
        title: '⚠️ 体重异常波动提醒',
        content: `${this.data.petName} ${t.text}。建议及时关注饮食与健康状况。`,
        showCancel: false
      });
    }
  },

  openForm() {
    const today = util.formatDate(new Date());
    const same = this.data.allRecords.find(r => r.date === today);
    this.setData({
      showForm: true,
      form: { weight: same ? String(same.weight) : '', date: today }
    });
  },
  closeForm() { this.setData({ showForm: false }); },
  noop() {},
  onWeight(e) { this.setData({ 'form.weight': e.detail.value }); },
  onDate(e) { this.setData({ 'form.date': e.detail.value }); },

  saveWeight() {
    const w = parseFloat(this.data.form.weight);
    const date = this.data.form.date;
    if (!w || w <= 0 || w > 200) { wx.showToast({ title: '请输入有效体重', icon: 'none' }); return; }
    if (!date) { wx.showToast({ title: '请选择日期', icon: 'none' }); return; }
    // 同一天重复记录时覆盖，避免曲线出现重复点
    const all = this.data.allRecords.slice();
    const idx = all.findIndex(r => r.date === date);
    if (idx > -1) all[idx] = { ...all[idx], weight: w };
    else all.push({ id: 'w' + Date.now(), date, weight: w });
    all.sort((a, b) => a.date.localeCompare(b.date));
    // 写入数据源，离开页面后再进入不会丢失
    mock.weights[this.data.id] = all;
    const pet = mock.pets.find(p => p.id === this.data.id);
    if (pet) pet.weight = all[all.length - 1].weight;
    this.setData({ allRecords: all, showForm: false });
    this.applyRange(this.data.range);
    wx.showToast({ title: idx > -1 ? '已更新当日体重 ⚖️' : '已记录 ⚖️', icon: 'none' });
  },

  // Canvas 折线图
  drawChart() {
    const recs = this.data.records;
    if (!this.chartRatio) return; // 未完成 onReady 尺寸换算时不绘制，避免被裁切
    const ctx = wx.createCanvasContext('weightChart', this);
    const k = this.chartRatio;
    const W = 640 * k, H = 420 * k;
    const padL = 78 * k, padR = 30 * k, padT = 46 * k, padB = 76 * k;
    const iw = W - padL - padR, ih = H - padT - padB;
    ctx.clearRect(0, 0, W, H);

    // 网格
    ctx.setStrokeStyle('#F5E3CE');
    ctx.setLineWidth(1);
    ctx.setFillStyle('#B08968');
    ctx.setFontSize(22 * k);
    const vLines = 5;
    let maxW = 0, minW = Infinity;
    recs.forEach(r => { maxW = Math.max(maxW, r.weight); minW = Math.min(minW, r.weight); });
    if (recs.length === 1) { maxW = recs[0].weight + 1; minW = Math.max(0, recs[0].weight - 1); }
    const span = maxW - minW || 1;
    const top = maxW + span * 0.15;
    const bottom = Math.max(0, minW - span * 0.15);
    const step = (top - bottom) / vLines;
    for (let i = 0; i <= vLines; i++) {
      const val = bottom + step * i;
      const y = padT + ih - ((val - bottom) / (top - bottom)) * ih;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(1) + 'kg', 6 * k, y + 7 * k);
    }

    if (!recs.length) {
      ctx.setFillStyle('#C9A381');
      ctx.setFontSize(24 * k);
      ctx.fillText('暂无体重数据', W / 2 - 70 * k, H / 2);
      ctx.draw();
      return;
    }

    const xStep = iw / Math.max(1, recs.length - 1);
    const pts = recs.map((r, i) => ({
      x: padL + xStep * i,
      y: padT + ih - ((r.weight - bottom) / (top - bottom)) * ih
    }));

    // 面积渐变
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
    grad.addColorStop(0, 'rgba(255, 154, 74, 0.35)');
    grad.addColorStop(1, 'rgba(255, 154, 74, 0.02)');
    ctx.setFillStyle(grad);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, padT + ih);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, padT + ih);
    ctx.closePath();
    ctx.fill();

    // 折线
    ctx.setStrokeStyle('#F47521');
    ctx.setLineWidth(4 * k);
    ctx.setLineCap('round');
    ctx.setLineJoin('round');
    ctx.beginPath();
    pts.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    // 数据点 + 数值
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7 * k, 0, Math.PI * 2);
      ctx.setFillStyle('#FFFFFF');
      ctx.fill();
      ctx.setStrokeStyle('#F47521');
      ctx.setLineWidth(4 * k);
      ctx.stroke();
      ctx.setFillStyle('#8C5A2B');
      ctx.setFontSize(22 * k);
      ctx.fillText(recs[i].weight.toFixed(1), p.x - 17 * k, p.y - 18 * k);
    });

    // X 轴日期
    ctx.setFillStyle('#B08968');
    ctx.setFontSize(22 * k);
    const labelIdx = [0, Math.floor((recs.length - 1) / 2), recs.length - 1];
    labelIdx.forEach(i => {
      const d = recs[i].date.slice(5).replace('-', '/');
      ctx.fillText(d, pts[i].x - 20 * k, H - padB + 38 * k);
    });

    ctx.draw();
  }
});
