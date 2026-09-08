const mock = require('../../utils/mock.js');

Page({
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
    const d = mock.feeds[id] || { plans: [], records: [] };
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    // 今天尚未打卡的计划
    const doneDates = new Set(d.records.filter(r => r.date === today).map(r => r.time.slice(0,5)));
    const plans = d.plans.map(p => ({ ...p, doneToday: doneDates.has(p.time) }));
    this.setData({ id, petName: pet ? pet.name : '', plans, records: d.records.slice().reverse(), today });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的投喂' });
  },

  // 标记已投喂
  markDone(e) {
    const plan = this.data.plans.find(p => p.id === e.currentTarget.dataset.id);
    if (!plan) return;
    const now = new Date();
    const hm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const rec = {
      id: 'fr' + Date.now(), petId: this.data.id, date: this.data.today,
      time: hm, user: '我', content: plan.content, status: 'done'
    };
    const records = [rec].concat(this.data.records);
    const plans = this.data.plans.map(p => p.id === plan.id ? { ...p, doneToday: true } : p);
    this.setData({ plans, records });
    wx.showToast({ title: '已标记投喂 🍚', icon: 'none' });
  },

  // 标记未投喂
  markMiss(e) {
    const id = e.currentTarget.dataset.id;
    const plans = this.data.plans.map(p => p.id === id ? { ...p, doneToday: false } : p);
    this.setData({ plans });
    wx.showToast({ title: '已标记未投喂', icon: 'none' });
  },

  togglePlanNotify(e) {
    const id = e.currentTarget.dataset.id;
    const plans = this.data.plans.map(p => p.id === id ? { ...p, notify: e.detail.value } : p);
    this.setData({ plans });
  },

  delPlan(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除投喂计划？',
      content: '删除后将不再提醒该时段',
      success: (r) => {
        if (r.confirm) this.setData({ plans: this.data.plans.filter(p => p.id !== id) });
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
    const plan = {
      id: 'fp' + Date.now(), petId: this.data.id,
      time: f.time, content: f.content || '默认餐食', notify: f.notify
    };
    const plans = this.data.plans.concat(plan).sort((a, b) => a.time.localeCompare(b.time))
      .map(p => ({ ...p, doneToday: p.doneToday || false }));
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
