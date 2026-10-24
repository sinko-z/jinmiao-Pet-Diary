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
    tab: 'vaccine',          // vaccine / deworm / check
    reminders: [],
    vaccineList: [],
    dewormList: [],
    checkList: [],
    aheadOptions: [3, 7, 14, 30],
    aheadIndex: 1,
    aheadDays: 7,
    showForm: false,
    formType: 'vaccine',
    form: {}
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    // 保证数据源存在，新增记录可持久保存在 mock 中
    const h = mock.healths[id] = mock.healths[id] || { vaccines: [], deworm: [], checks: [] };
    this.setData({
      id,
      petName: pet ? pet.name : '',
      vaccineList: this.sortByDate(h.vaccines).reverse(),
      dewormList: this.sortByDate(h.deworm).reverse(),
      checkList: this.sortByDate(h.checks).reverse().map(c => ({ ...c, resultHead: (c.result || '').split('，')[0] }))
    });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的健康档案' });
    this.buildReminders();
  },

  // 按日期升序（空日期排最后），用于展示时再 reverse 成新→旧
  sortByDate(list) {
    return list.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  },

  // 距今天数（日期非法返回 null）
  daysFromToday(dateStr) {
    const d = util.toDate(dateStr);
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((d - today) / 86400000);
  },

  buildReminders() {
    const ahead = this.data.aheadDays;
    const list = [];
    this.data.vaccineList.forEach(v => {
      const diff = this.daysFromToday(v.nextDate);
      if (diff === null || diff < -1 || diff > ahead) return;
      list.push({
        key: v.id, icon: '💉', due: diff,
        text: `${this.data.petName} 的${v.name}将在 ${v.nextDate} 到期，请及时接种`,
        level: 'warn'
      });
    });
    this.data.dewormList.forEach(d => {
      const diff = this.daysFromToday(d.nextDate);
      if (diff === null || diff < -1 || diff > ahead) return;
      list.push({
        key: d.id, icon: '🪱', due: diff,
        text: `${this.data.petName} 的${d.type}将在 ${d.nextDate} 到期，记得安排`,
        level: 'info'
      });
    });
    // 按到期时间由近到远排序
    list.sort((a, b) => a.due - b.due);
    this.setData({ reminders: list });
  },

  onAheadChange(e) {
    const idx = Number(e.detail.value);
    const days = this.data.aheadOptions[idx] || 7;
    this.setData({ aheadIndex: idx, aheadDays: days });
    this.buildReminders();
  },

  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }); },

  openForm(e) {
    const type = e.currentTarget.dataset.type || 'vaccine';
    this.setData({
      showForm: true, formType: type,
      form: type === 'vaccine'
        ? { name: '', date: '', nextDate: '', hospital: '' }
        : type === 'deworm'
          ? { type: '体内驱虫', date: '', nextDate: '' }
          : { date: '', result: '', note: '', org: '' }
    });
  },

  closeForm() { this.setData({ showForm: false }); },
  noop() {},
  onFormInput(e) {
    const key = e.currentTarget.dataset.key;
    const val = e.detail && e.detail.value !== undefined ? e.detail.value : e.currentTarget.dataset.value;
    this.setData({ ['form.' + key]: val });
  },
  onFormDate(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  saveForm() {
    const f = this.data.form;
    if (!f.date) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    if (this.data.formType === 'vaccine' && !(f.name || '').trim()) {
      wx.showToast({ title: '请填写疫苗名称', icon: 'none' });
      return;
    }
    const keyMap = { vaccine: 'vaccines', deworm: 'deworm', check: 'checks' };
    const listKeyMap = { vaccine: 'vaccineList', deworm: 'dewormList', check: 'checkList' };
    const storeKey = keyMap[this.data.formType];
    const listKey = listKeyMap[this.data.formType];
    let item;
    if (this.data.formType === 'vaccine') {
      item = { id: 'v' + Date.now(), name: f.name.trim(), date: f.date, nextDate: f.nextDate || '', hospital: (f.hospital || '').trim() };
    } else if (this.data.formType === 'deworm') {
      item = { id: 'd' + Date.now(), type: f.type, date: f.date, nextDate: f.nextDate || '' };
    } else {
      item = { id: 'c' + Date.now(), date: f.date, result: f.result || '正常', note: (f.note || '').trim(), org: (f.org || '').trim() };
    }
    // 写入数据源，离开页面后记录不会丢失
    const store = mock.healths[this.data.id];
    if (store) store[storeKey].push(item);
    const display = this.data.formType === 'check' ? { ...item, resultHead: (item.result || '').split('，')[0] } : item;
    // 新记录插到最前面（展示顺序为新→旧）
    const next = [display].concat(this.data[listKey]);
    this.setData({ [listKey]: next, showForm: false });
    wx.showToast({ title: '已保存 ✓', icon: 'none' });
    this.buildReminders();
  }
});
