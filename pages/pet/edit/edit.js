const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');
const { KINDS } = require('../../../utils/breeds.js');

const KIND_STYLE = {
  cat: { emoji: '🐱', color: '#FF9F4A', coverGradient: 'linear-gradient(135deg,#FFE3A9,#FFC46B)' },
  dog: { emoji: '🐶', color: '#E8A13C', coverGradient: 'linear-gradient(135deg,#FCD9A0,#E8A13C)' },
  other: { emoji: '🐹', color: '#7BA05B', coverGradient: 'linear-gradient(135deg,#F1F6E4,#CDE0B3)' }
};

Page({
  // 返回上一页（兼容从分享/扫码直接进入的情况）
  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/index/index' });
  },

  data: {
    isEdit: false,
    kinds: KINDS,
    kindOptions: KINDS.map(k => k.label),
    breedOptions: KINDS[0].breeds,
    breedIndex: -1,
    kindIndex: 0,
    kindLabel: '🐱 猫咪',
    form: {
      id: '', name: '', type: 'home', kind: 'cat', species: '', breed: '', gender: '弟弟',
      birthday: '', weight: '', hobbies: '', favoriteFood: '', noFoods: '', notes: '', intro: '',
      sterilized: false, vaccinated: false, photos: []
    },
    genderOptions: ['弟弟', '妹妹'],
    typeOptions: [
      { key: 'home', emoji: '🏠', name: '家养宠物', desc: '自家饲养的毛孩子' },
      { key: 'stray', emoji: '🐾', name: '流浪救助', desc: '救助或关注的流浪动物' }
    ]
  },

  onLoad(query) {
    if (query.id) {
      const src = mock.pets.find(p => p.id === query.id);
      if (src) {
        wx.setNavigationBarTitle({ title: '编辑宠物档案' });
        const kindKey = src.kind || 'cat';
        const kindIdx = Math.max(0, KINDS.findIndex(k => k.key === kindKey));
        const breedOptions = KINDS[kindIdx].breeds;
        const form = {
          id: src.id, name: src.name, type: src.type, kind: kindKey,
          species: src.species, breed: src.breed || '', gender: src.gender,
          birthday: src.birthday, weight: String(src.weight),
          hobbies: src.hobbies, favoriteFood: src.favoriteFood,
          noFoods: src.noFoods || '', notes: src.notes || '',
          intro: src.intro, sterilized: src.sterilized,
          vaccinated: src.vaccinated, photos: src.avatar ? [src.avatar] : []
        };
        this.setData({
          isEdit: true,
          form,
          breedOptions,
          kindIndex: kindIdx,
          kindLabel: KINDS[kindIdx].label,
          breedIndex: form.breed ? breedOptions.indexOf(form.breed) : -1
        });
      }
    }
  },

  // 动物种类切换：联动品种列表
  onKindChange(e) {
    const idx = Number(e.detail.value);
    const kind = KINDS[idx];
    this.setData({
      'form.kind': kind.key,
      kindIndex: idx,
      kindLabel: kind.label,
      breedOptions: kind.breeds,
      'form.breed': '',
      breedIndex: -1
    });
  },

  // 品种选择
  onBreedChange(e) {
    const idx = Number(e.detail.value);
    this.setData({
      'form.breed': this.data.breedOptions[idx],
      breedIndex: idx
    });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onTypeTap(e) {
    this.setData({ 'form.type': e.currentTarget.dataset.key });
  },

  onGenderTap(e) {
    this.setData({ 'form.gender': e.currentTarget.dataset.value });
  },

  onSwitch(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  onBirthday(e) {
    this.setData({ 'form.birthday': e.detail.value });
  },

  choosePhoto() {
    const left = 9 - this.data.form.photos.length;
    if (left <= 0) { wx.showToast({ title: '最多 9 张', icon: 'none' }); return; }
    wx.chooseMedia({
      count: left, mediaType: ['image'], sizeType: ['compressed'],
      success: (res) => {
        const photos = this.data.form.photos.concat(res.tempFiles.map(f => f.tempFilePath));
        this.setData({ 'form.photos': photos });
      }
    });
  },

  removePhoto(e) {
    const idx = e.currentTarget.dataset.index;
    const photos = this.data.form.photos.filter((_, i) => i !== idx);
    this.setData({ 'form.photos': photos });
  },

  previewPhoto(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({ urls: this.data.form.photos, current: url });
  },

  save() {
    const f = this.data.form;
    const name = (f.name || '').trim();
    if (!name) { wx.showToast({ title: '请填写宠物昵称', icon: 'none' }); return; }
    // 体重校验：允许留空，填写则必须是 1~200 之间的数字
    const weight = Number(f.weight);
    if (f.weight !== '' && (!isFinite(weight) || weight <= 0 || weight > 200)) {
      wx.showToast({ title: '体重请填写 0~200 之间的数字', icon: 'none' });
      return;
    }
    const kind = KINDS.find(k => k.key === f.kind) || KINDS[0];
    const style = KIND_STYLE[kind.key];
    const user = getApp().globalData.user;
    // 通用字段：新增与编辑都刷新这些内容
    const fields = {
      name,
      type: f.type,
      typeText: f.type === 'stray' ? '流浪救助' : '家养宠物',
      kind: kind.key,
      breed: f.breed || '',
      species: (f.species || '').trim() || f.breed || '未填写品种',
      gender: f.gender,
      birthday: f.birthday || '',
      ageText: util.ageText(f.birthday),
      weight: f.weight === '' ? 0 : Math.round(weight * 10) / 10,
      hobbies: (f.hobbies || '').trim() || '暂无记录',
      favoriteFood: (f.favoriteFood || '').trim() || '暂无记录',
      noFoods: (f.noFoods || '').trim(),
      notes: (f.notes || '').trim(),
      intro: (f.intro || '').trim() || '刚加入金喵宠物日记的新朋友。',
      sterilized: !!f.sterilized,
      vaccinated: !!f.vaccinated,
      avatar: f.photos[0] || '',
      emoji: style.emoji,
      color: style.color,
      coverGradient: style.coverGradient
    };

    wx.showLoading({ title: '保存中…' });
    setTimeout(() => {
      wx.hideLoading();
      if (this.data.isEdit) {
        const src = mock.pets.find(p => p.id === f.id);
        if (src) Object.assign(src, fields);
        else mock.pets.unshift(Object.assign({ id: f.id, members: [], friends: [], tags: [] }, fields));
        wx.showToast({ title: '档案已更新', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 700);
        return;
      }
      // 新建档案：写入 mock 数据源，返回首页 / 详情页即可看到
      const id = 'p' + Date.now();
      const pet = Object.assign({
        id,
        tags: [fields.typeText],
        lost: false,
        story: '',
        members: [{
          id: 'u' + Date.now(),
          name: user ? user.nickName : '我',
          role: 'admin',
          avatar: '',
          color: (user && user.avatarColor) || '#F2B04C'
        }],
        friends: []
      }, fields);
      mock.pets.unshift(pet);
      wx.showToast({ title: '创建成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/pet/detail/detail?id=' + id });
      }, 700);
    }, 400);
  }
});
