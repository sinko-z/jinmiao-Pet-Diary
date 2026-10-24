const mock = require('../../../utils/mock.js');
const util = require('../../../utils/util.js');

Page({
  data: {
    id: '',
    pet: null,
    growthCount: 0,
    friends: [],
    showFriend: false,
    friendName: '',
    memberCountText: '',
    showInvite: false,
    inviteLink: '',
    inviteCode: '',
    inviteFrom: '',
    joinVisible: false,
    healthWarn: null
  },

  onLoad(query) {
    this.query = query || {};
    this.load(this.query.id || 'p1');
    // 从「我的 - 邀请家人」进入时，直接弹出邀请卡
    if (this.query.invite === '1') {
      setTimeout(() => this.invite(), 300);
    }
  },

  onShow() {
    // 从编辑档案返回时刷新最新数据（首次 onShow 由 onLoad 负责）
    if (this._loaded) this.load(this.data.id);
  },

  load(id) {
    const pet = mock.pets.find(p => p.id === id);
    if (!pet) {
      wx.showToast({ title: '宠物档案不存在', icon: 'none' });
      setTimeout(() => this.goBack(), 800);
      return;
    }
    // 被邀请打开：query 带 invite 参数
    const inviteFrom = this.query.from
      ? decodeURIComponent(this.query.from)
      : (this.query.invite && this.query.invite !== '1' ? '好友邀请你一起记录 TA 的成长 🐾' : '');
    const weights = mock.weights[id] || [];
    // 预计算成员头像首字（WXML 不支持表达式调方法）
    pet.members = (pet.members || []).map(m => ({ ...m, firstChar: (m.name || '?').slice(0, 1) }));
    // 计算即将到期的健康提醒（未来 10 天内到期则展示提醒条）
    let healthWarn = null;
    const hs = mock.healths[id] || { vaccines: [], deworm: [] };
    const today = new Date();
    const near = (ds) => {
      if (!ds) return false;
      const d = util.toDate(ds);
      if (!d) return false;
      const diff = Math.ceil((d - today) / 86400000);
      return diff >= -1 && diff <= 10;
    };
    const v = (hs.vaccines || []).find(x => near(x.nextDate));
    const dw = (hs.deworm || []).find(x => near(x.nextDate));
    if (v) healthWarn = { text: pet.name + ' 的' + v.name + '将在 ' + v.nextDate + ' 到期，请及时安排接种', url: '/pages/health/health' };
    else if (dw) healthWarn = { text: pet.name + ' 的' + dw.type + '将在 ' + dw.nextDate + ' 到期，记得安排', url: '/pages/health/health' };

    this.setData({
      id,
      pet,
      growthCount: (mock.growths[id] || []).length,
      friends: pet.friends || [],
      memberCountText: pet.members.length >= 30 ? '已达上限 30 人' : '还可邀请 ' + (30 - pet.members.length) + ' 位家人',
      inviteFrom,
      // 有邀请参数且未满员时展示“加入宠物家庭”横幅
      joinVisible: !!inviteFrom && pet.members.length < 30,
      healthWarn
    });
    wx.setNavigationBarTitle({ title: pet.name + ' 的档案' });
    this._loaded = true;
  },

  // ===== v1.1：好友 / 成长故事 / 邀请家人 / 附近宠物 =====

  // 添加好朋友（可选择附近宠物）
  addFriend() {
    if (!getApp().ensureLogin('为宠物添加好朋友需要登录')) return;
    this.setData({ showFriend: true, friendName: '' });
  },

  closeFriend() { this.setData({ showFriend: false }); },
  noop() {},
  onFriendName(e) { this.setData({ friendName: e.detail.value }); },

  pickNearbyFriend() {
    this.setData({ showFriend: false });
    wx.navigateTo({ url: '/pages/pet/nearby/nearby?mode=friend' });
  },

  saveFriend() {
    const name = this.data.friendName.trim();
    if (!name) { wx.showToast({ title: '请输入好朋友名字', icon: 'none' }); return; }
    const pet = this.data.pet;
    const friends = this.data.friends.concat({ id: 'f' + Date.now(), name, emoji: '🐾', color: '#F2B04C' });
    this.setData({ friends, showFriend: false });
    pet.friends = friends;
    wx.showToast({ title: name + ' 已成为 ' + pet.name + ' 的好朋友 🎉', icon: 'none' });
  },

  // 编辑成长故事
  editStory() {
    if (!getApp().ensureLogin('编辑成长故事需要登录')) return;
    const pet = this.data.pet;
    wx.showModal({
      title: pet.name + ' 的成长故事',
      editable: true,
      placeholderText: '写下你和 TA 的故事…',
      content: pet.story || '',
      success: (r) => {
        if (r.confirm) {
          pet.story = (r.content || '').trim() || pet.story;
          this.setData({ 'pet.story': pet.story });
          wx.showToast({ title: '故事已更新 📖', icon: 'none' });
        }
      }
    });
  },

  // 通过邀请链接加入宠物家庭
  joinFamily() {
    if (!getApp().ensureLogin('加入宠物家庭需要登录')) return;
    const user = getApp().globalData.user;
    const pet = this.data.pet;
    if (pet.members.length >= 30) {
      wx.showToast({ title: '该宠物家庭已达 30 人上限', icon: 'none' });
      this.setData({ joinVisible: false });
      return;
    }
    // 防重复：已在家庭中则提示
    const exists = pet.members.some(m => m.name === user.nickName);
    if (exists) {
      wx.showToast({ title: '你已经是家庭一员啦 🐾', icon: 'none' });
      this.setData({ joinVisible: false });
      return;
    }
    wx.showModal({
      title: '加入宠物家庭',
      content: '确认加入「' + pet.name + '」的宠物家庭吗？加入后可共同记录、上传照片、打卡轨迹。',
      confirmText: '确认加入',
      confirmColor: '#F47521',
      success: (r) => {
        if (!r.confirm) return;
        // 加入后清掉邀请参数，避免返回本页时再次弹出横幅
        this.query.invite = '';
        this.query.from = '';
        pet.members = pet.members.concat({ id: 'u' + Date.now(), name: user.nickName, role: 'member', avatar: '', color: user.avatarColor || '#F2B04C', firstChar: user.nickName.slice(0, 1) });
        this.setData({
          'pet.members': pet.members,
          joinVisible: false,
          memberCountText: pet.members.length >= 30 ? '已达上限 30 人' : '还可邀请 ' + (30 - pet.members.length) + ' 位家人'
        });
        wx.showToast({ title: '欢迎加入 🎉 一起守护 ' + pet.name, icon: 'none' });
      }
    });
  },

  // 邀请好友加入宠物家庭（链接形式）
  invite() {
    if (!getApp().ensureLogin('邀请家人协作需要登录')) return;
    const pet = this.data.pet;
    if (!pet) return;
    const code = 'JM' + pet.id.toUpperCase() + (Date.now() % 100000);
    const link = 'https://pet.jinmiao.app/invite?pet=' + pet.id + '&code=' + code;
    this.setData({ showInvite: true, inviteLink: link, inviteCode: code });
  },

  closeInvite() { this.setData({ showInvite: false }); },

  // 复制邀请链接
  copyInvite() {
    wx.setClipboardData({
      data: this.data.inviteLink,
      success: () => wx.showToast({ title: '邀请链接已复制 🐾', icon: 'none' })
    });
  },

  // 附近的宠物
  goNearbyPets() {
    wx.navigateTo({ url: '/pages/pet/nearby/nearby' });
  },

  // 发布动态（社区是 tab 页，必须用 switchTab）
  goCommunity() {
    wx.switchTab({ url: '/pages/community/community' });
  },

  onShareAppMessage() {
    const p = this.data.pet;
    if (!p) return {};
    const code = this.data.inviteCode || ('JM' + p.id.toUpperCase());
    // 分享路径携带邀请参数，好友打开即进入档案并可一键加入宠物家庭
    const path = '/pages/pet/detail/detail?id=' + p.id + '&invite=' + code + '&from=' + encodeURIComponent('朋友邀请你一起记录 ' + p.name);
    return {
      title: `【宠物家庭邀请】${p.name} 的铲屎官邀请你一起记录 TA 的成长 🐾`,
      path
    };
  },

  // 各功能模块跳转
  go(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) return;
    wx.navigateTo({ url: `${url}?id=${this.data.id}` });
  },

  // 返回上一页
  goBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.switchTab({ url: '/pages/index/index' });
  },

  goEdit() {
    wx.navigateTo({ url: '/pages/pet/edit/edit?id=' + this.data.id });
  },

  // 公开查看提示（演示）
  onPublicTip() {
    wx.showToast({ title: '当前为公开浏览模式，登录后可参与记录', icon: 'none' });
  },

  // 一键发布走失 / 已找回时解除状态
  goLost() {
    const pet = this.data.pet;
    if (pet && pet.lost) {
      wx.showModal({
        title: '确认宠物已找回？',
        content: '解除后档案不再显示“走失中”，已发布的走失动态仍保留在社区。',
        confirmText: '已找回',
        confirmColor: '#7BA05B',
        success: (r) => {
          if (!r.confirm) return;
          pet.lost = false;
          this.load(this.data.id);
          wx.showToast({ title: '已解除走失状态 🐾', icon: 'none' });
        }
      });
      return;
    }
    wx.navigateTo({ url: '/pages/lost/lost?id=' + this.data.id });
  },

  onPullDownRefresh() {
    this.load(this.data.id);
    wx.stopPullDownRefresh();
  }
});
