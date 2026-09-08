const mock = require('../../utils/mock.js');

Page({
  data: {
    id: '',
    petName: '',
    tab: 'vaccine',          // vaccine / deworm / check
    reminders: [],
    vaccineList: [],
    dewormList: [],
    checkList: [],
    aheadDays: 7,
    showForm: false,
    formType: 'vaccine',
    form: {}
  },

  onLoad(query) {
    const id = query.id || 'p1';
    const pet = mock.pets.find(p => p.id === id);
    const h = mock.healths[id] || { vaccines: [], deworm: [], checks: [] };
    this.setData({
      id,
      petName: pet ? pet.name : '',
      vaccineList: h.vaccines.slice().reverse(),
      dewormList: h.deworm.slice().reverse(),
      checkList: h.checks.slice().reverse().map(c => ({ ...c, resultHead: (c.result || '').split('，')[0] }))
    });
    if (pet) wx.setNavigationBarTitle({ title: pet.name + ' 的健康档案' });
    this.buildReminders();
  },

  buildReminders() {
    const list = [];
    const ahead = this.data.aheadDays;
    const today = new Date();
    const near = (dateStr, days) => {
      const d = new Date(dateStr.replace(/-/g, '/'));
      const diff = Math.ceil((d - today) / 86400000);
      return diff <= days && diff >= -1; // 到期前后提醒
    };
    this.data.vaccineList.forEach(v => {
      if (near(v.nextDate, ahead)) list.push({ icon: '💉', text: `${this.data.petName} 的${v.name}将在 ${v.nextDate} 到期，请及时接种`, level: 'warn' });
    });
    this.data.dewormList.forEach(d => {
      if (near(d.nextDate, ahead)) list.push({ icon: '🪱', text: `${this.data.petName} 的${d.type}将在 ${d.nextDate} 到期，记得安排`, level: 'info' });
    });
    this.setData({ reminders: list });
  },

  onAheadChange(e) {
    this.setData({ aheadDays: Number(e.detail.value) });
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
    const keyMap = { vaccine: 'vaccineList', deworm: 'dewormList', check: 'checkList' };
    const listKey = keyMap[this.data.formType];
    let item;
    if (this.data.formType === 'vaccine') {
      item = { id: 'v' + Date.now(), name: f.name || '疫苗', date: f.date, nextDate: f.nextDate, hospital: f.hospital };
    } else if (this.data.formType === 'deworm') {
      item = { id: 'd' + Date.now(), type: f.type, date: f.date, nextDate: f.nextDate };
    } else {
      item = { id: 'c' + Date.now(), date: f.date, result: f.result || '正常', note: f.note, org: f.org };
    }
    const next = [item].concat(this.data[listKey]);
    this.setData({ [listKey]: next, showForm: false });
    wx.showToast({ title: '已保存 ✓', icon: 'none' });
    this.buildReminders();
  }
});

