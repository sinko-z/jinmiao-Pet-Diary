const mock = require('../../../utils/mock.js');

Page({
  data: {
    categories: [
      { key: '宠物医院', emoji: '🏥', name: '宠物医院', desc: '诊疗 / 疫苗 / 体检' },
      { key: '宠物店', emoji: '🛍️', name: '宠物店', desc: '洗护 / 美容 / 用品 / 寄养' },
      { key: '宠物公园', emoji: '🌳', name: '宠物公园', desc: '活动区域 / 遛狗' }
    ],
    form: {
      category: '宠物店',
      shopName: '',
      address: '',
      phone: '',
      intro: '',
      license: '',      // 营业执照照片
      idcardFront: '',  // 身份证人像面
      idcardBack: ''    // 身份证国徽面
    },
    existing: null
  },

  onLoad() {
    // 恢复已提交的申请
    let existing = null;
    try { existing = wx.getStorageSync('merchantApp') || null; } catch (e) {}
    if (existing) {
      this.setData({ existing });
      wx.setNavigationBarTitle({ title: '入驻申请' });
    }
  },

  onCat(e) { this.setData({ 'form.category': e.currentTarget.dataset.key }); },
  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: e.detail.value });
  },

  upload(e) {
    const key = e.currentTarget.dataset.key;
    const names = { license: '营业执照', idcardFront: '身份证人像面', idcardBack: '身份证国徽面' };
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sizeType: ['compressed'],
      success: (res) => {
        const file = res.tempFiles[0].tempFilePath;
        this.setData({ ['form.' + key]: file });
        wx.showToast({ title: names[key] + ' 已上传 ✓', icon: 'none' });
      }
    });
  },

  preview(e) { wx.previewImage({ urls: [e.currentTarget.dataset.url] }); },

  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/shop/index/index' });
  },

  goManage() { wx.redirectTo({ url: '/pages/shop/manage/manage' }); },

  submit() {
    const f = this.data.form;
    if (!f.shopName.trim()) { wx.showToast({ title: '请填写店铺名称', icon: 'none' }); return; }
    if (!f.license) { wx.showToast({ title: '请上传营业执照', icon: 'none' }); return; }
    if (!f.idcardFront || !f.idcardBack) { wx.showToast({ title: '请上传身份证正反面', icon: 'none' }); return; }

    wx.showLoading({ title: '提交审核中…' });
    setTimeout(() => {
      wx.hideLoading();
      const app = {
        id: 'app' + Date.now(),
        category: f.category,
        shopName: f.shopName.trim(),
        address: f.address.trim() || '待补充',
        phone: f.phone.trim(),
        intro: f.intro.trim(),
        license: f.license,
        idcardFront: f.idcardFront,
        idcardBack: f.idcardBack,
        status: 'reviewing',     // reviewing 审核中
        submitTime: '2026-09-07',
        applicant: getApp().globalData.user ? getApp().globalData.user.nickName : '我'
      };
      wx.setStorageSync('merchantApp', app);
      this.setData({ existing: app });
      wx.showModal({
        title: '🐾 申请已提交',
        content: '资料已收到，真实环境将在 1-3 个工作日内人工审核。\n\n演示模式：可直接模拟“审核通过”，体验商家后台。',
        confirmText: '模拟通过（演示）',
        cancelText: '仅提交',
        confirmColor: '#F47521',
        success: (r) => {
          if (r.confirm) {
            // 演示：审核通过并挂到一家示例店铺
            const demo = mock.shops[0];
            const verified = Object.assign({}, app, {
              status: 'verified',
              shopId: demo.id,
              reviewTime: '2026-09-07',
              shopName: demo.name
            });
            wx.setStorageSync('merchantApp', verified);
            wx.showToast({ title: '审核通过 🎉', icon: 'success' });
            setTimeout(() => wx.redirectTo({ url: '/pages/shop/manage/manage' }), 600);
          } else {
            wx.redirectTo({ url: '/pages/shop/manage/manage' });
          }
        }
      });
    }, 900);
  }
});
