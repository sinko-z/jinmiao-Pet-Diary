const mock = require('../../utils/mock.js');
const util = require('../../utils/util.js');

Page({
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
    form: { weight: '', date: '' }
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    const all = (mock.weights[id] || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    this.setData({ id, petName: pet ? pet.name : '', allRecords: all });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的体重' });
    this.applyRange('3m');
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
      records = all.filter(r => new Date(r.date.replace(/-/g, '/')) >= cutoff);
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
    this.setData({ showForm: true, form: { weight: '', date: today } });
  },
  closeForm() { this.setData({ showForm: false }); },
  noop() {},
  onWeight(e) { this.setData({ 'form.weight': e.detail.value }); },
  onDate(e) { this.setData({ 'form.date': e.detail.value }); },

  saveWeight() {
    const w = parseFloat(this.data.form.weight);
    if (!w || w <= 0 || w > 200) { wx.showToast({ title: '请输入有效体重', icon: 'none' }); return; }
    const rec = { id: 'w' + Date.now(), date: this.data.form.date, weight: w };
    const all = this.data.allRecords.concat(rec).sort((a, b) => a.date.localeCompare(b.date));
    this.setData({ allRecords: all, showForm: false });
    this.applyRange(this.data.range);
    wx.showToast({ title: '已记录 ⚖️', icon: 'none' });
  },

  // Canvas 折线图
  drawChart() {
    const recs = this.data.records;
    const ctx = wx.createCanvasContext('weightChart', this);
    const W = 640, H = 420;
    const padL = 70, padR = 30, padT = 40, padB = 70;
    const iw = W - padL - padR, ih = H - padT - padB;
    ctx.clearRect(0, 0, W, H);

    // 网格
    ctx.setStrokeStyle('#F5E3CE');
    ctx.setLineWidth(1);
    ctx.setFillStyle('#B08968');
    ctx.setFontSize(18);
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
      ctx.fillText(val.toFixed(1) + 'kg', 8, y + 6);
    }

    if (!recs.length) {
      ctx.setFillStyle('#C9A381');
      ctx.setFontSize(22);
      ctx.fillText('暂无体重数据', W / 2 - 60, H / 2);
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
    ctx.setLineWidth(4);
    ctx.setLineCap('round');
    ctx.setLineJoin('round');
    ctx.beginPath();
    pts.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
    ctx.stroke();

    // 数据点 + 数值
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.setFillStyle('#FFFFFF');
      ctx.fill();
      ctx.setStrokeStyle('#F47521');
      ctx.setLineWidth(4);
      ctx.stroke();
      ctx.setFillStyle('#8C5A2B');
      ctx.setFontSize(20);
      ctx.fillText(recs[i].weight.toFixed(1), p.x - 16, p.y - 16);
    });

    // X 轴日期
    ctx.setFillStyle('#B08968');
    ctx.setFontSize(18);
    const labelIdx = [0, Math.floor((recs.length - 1) / 2), recs.length - 1];
    labelIdx.forEach(i => {
      const d = recs[i].date.slice(5).replace('-', '/');
      ctx.fillText(d, pts[i].x - 18, H - padB + 36);
    });

    ctx.draw();
  }
});

