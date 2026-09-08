const mock = require('../../../utils/mock.js');
const { KINDS } = require('../../../utils/breeds.js');

Page({
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
    if (!f.name.trim()) { wx.showToast({ title: '请填写宠物昵称', icon: 'none' }); return; }
    wx.showLoading({ title: '保存中…' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: this.data.isEdit ? '档案已更新' : '创建成功', icon: 'success' });
      setTimeout(() => {
        if (this.data.isEdit) wx.navigateBack();
        else wx.redirectTo({ url: '/pages/pet/detail/detail?id=p1' });
      }, 800);
    }, 500);
  }
});
