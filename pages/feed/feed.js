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
    plans: [],
    records: [],
    today: '',
    currentTime: '',
    showAddPlan: false,
    planForm: { time: '08:00', content: '', notify: true }
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    // 保证数据源存在，后续新增计划/打卡可以持久保存在 mock 中
    const d = mock.feeds[id] = mock.feeds[id] || { plans: [], records: [] };
    const today = util.formatDate(new Date());
    this.setData({
      id,
      petName: pet ? pet.name : '',
      today,
      plans: this.decoratePlans(d.plans, d.records, today),
      records: this.sortRecords(d.records)
    });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的投喂' });
  },

  // 记录按日期+时间倒序
  sortRecords(records) {
    return records.slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  },

  // 计划与今天的打卡记录匹配：按“同一小时”判断，避免打卡时间与计划时间差几分钟就匹配不上
  decoratePlans(plans, records, today) {
    const todayRecords = records.filter(r => r.date === today);
    return plans.slice().sort((a, b) => a.time.localeCompare(b.time)).map(p => {
      const hit = todayRecords.find(r => r.time.slice(0, 2) === p.time.slice(0, 2));
      return { ...p, doneToday: !!hit, doneRecordId: hit ? hit.id : '' };
    });
  },

  // 标记已投喂
  markDone(e) {
    const plan = this.data.plans.find(p => p.id === e.currentTarget.dataset.id);
    if (!plan || plan.doneToday) return;
    const now = new Date();
    const rec = {
      id: 'fr' + Date.now(),
      petId: this.data.id,
      date: this.data.today,
      time: util.pad(now.getHours()) + ':' + util.pad(now.getMinutes()),
      user: '我',
      content: plan.content,
      status: 'done'
    };
    const store = mock.feeds[this.data.id];
    if (store) store.records.unshift(rec);
    const plans = this.data.plans.map(p => p.id === plan.id ? { ...p, doneToday: true, doneRecordId: rec.id } : p);
    this.setData({ plans, records: [rec].concat(this.data.records) });
    wx.showToast({ title: '已标记投喂 🍚', icon: 'none' });
  },

  // 标记未投喂（同时撤销今天由该计划生成的打卡记录）
  markMiss(e) {
    const plan = this.data.plans.find(p => p.id === e.currentTarget.dataset.id);
    if (!plan) return;
    const recId = plan.doneRecordId;
    const store = mock.feeds[this.data.id];
    if (store && recId) store.records = store.records.filter(r => r.id !== recId);
    this.setData({
      plans: this.data.plans.map(p => p.id === plan.id ? { ...p, doneToday: false, doneRecordId: '' } : p),
      records: recId ? this.data.records.filter(r => r.id !== recId) : this.data.records
    });
    wx.showToast({ title: '已标记未投喂', icon: 'none' });
  },

  togglePlanNotify(e) {
    const id = e.currentTarget.dataset.id;
    const notify = e.detail.value;
    const store = mock.feeds[this.data.id];
    if (store) {
      const src = store.plans.find(p => p.id === id);
      if (src) src.notify = notify;
    }
    this.setData({ plans: this.data.plans.map(p => p.id === id ? { ...p, notify } : p) });
  },

  delPlan(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除投喂计划？',
      content: '删除后将不再提醒该时段',
      success: (r) => {
        if (!r.confirm) return;
        const store = mock.feeds[this.data.id];
        if (store) store.plans = store.plans.filter(p => p.id !== id);
        this.setData({ plans: this.data.plans.filter(p => p.id !== id) });
      }
    });
  },

  openAdd() { this.setData({ showAddPlan: true, planForm: { time: '08:00', content: '', notify: true } }); },
  closeAdd() { this.setData({ showAddPlan: false }); },
  noop() {},
  onPlanTime(e) { this.setData({ 'planForm.time': e.detail.value }); },
  onPlanContent(e) { this.setData({ 'planForm.content': e.detail.value }); },
  onPlanNotify(e) { this.setData({ 'planForm.notify': e.detail.value }); },

  savePlan() {
    const f = this.data.planForm;
    if (this.data.plans.some(p => p.time === f.time)) {
      wx.showToast({ title: '该时段已有计划啦', icon: 'none' });
      return;
    }
    const plan = {
      id: 'fp' + Date.now(), petId: this.data.id,
      time: f.time, content: f.content || '默认餐食', notify: f.notify
    };
    const store = mock.feeds[this.data.id];
    if (store) store.plans.push(plan);
    const plans = this.data.plans.concat(plan)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(p => ({ ...p, doneToday: p.doneToday || false, doneRecordId: p.doneRecordId || '' }));
    this.setData({ plans, showAddPlan: false });
    wx.showToast({ title: '计划已添加', icon: 'success' });
  },

  requestNotify() {
    // 订阅消息授权演示
    wx.showModal({
      title: '开启投喂提醒',
      content: '到达投喂时间将向所有协作者推送提醒（基于微信订阅消息）',
      confirmText: '同意订阅',
      success: (r) => {
        if (r.confirm) wx.showToast({ title: '已开启提醒 🔔', icon: 'none' });
      }
    });
  }
});
