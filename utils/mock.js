/**
 * mock.js —— 演示数据层
 * 真实项目中替换为云开发 / 后端接口即可，页面数据结构保持不变。
 */
const P = (name, emoji, color) => ({ name, emoji, color });

// 宠物档案
const pets = [
  {
    id: 'p1',
    name: '团子',
    type: 'home',            // home 家养 / stray 流浪
    typeText: '家养宠物',
    emoji: '🐱',
    color: '#FF9F4A',
    avatar: '',
    species: '英短蓝猫',
    gender: '弟弟',
    ageText: '2 岁 3 个月',
    birthday: '2024-05-20',
    weight: 4.6,
    hobbies: '喜欢玩逗猫棒、怕打雷、爱钻纸箱',
    favoriteFood: '三文鱼、鸡胸肉、冻干鹌鹑',
    sterilized: true,
    vaccinated: true,
    intro: '圆滚滚的小吃货，睡觉会打呼噜，听到零食袋声音秒出现。',
    tags: ['粘人', '干饭王'],
    lost: false,
    coverGradient: 'linear-gradient(135deg,#FFD9A8,#FFB36B)',
    kind: 'cat',
    breed: '英国短毛猫',
    noFoods: '牛奶、巧克力、葱蒜类',
    notes: '怕打雷，雷雨天要抱紧；每周梳毛 3 次防毛球',
    story: '2024 年 5 月 20 日在宠物店一眼选中了它，当时它躲在小角落。回家第一天就霸占了沙发，现在已经是全家的小管家——每天准时叫我们起床、监督我们吃饭。这一年多，看着它从巴掌大长成 4.6kg 的小胖子，幸福感爆棚。',
    friends: [{ id: 'f1', name: '小橘', emoji: '🐈', color: '#F47521' }, { id: 'f2', name: '隔壁柴柴', emoji: '🐕', color: '#E8A13C' }],
    members: [
      { id: 'u1', name: '小喵', role: 'admin', avatar: '', color: '#FF9F4A' },
      { id: 'u2', name: '奶爸', role: 'member', avatar: '', color: '#F2B04C' },
      { id: 'u3', name: '外婆', role: 'member', avatar: '', color: '#7BA05B' }
    ]
  },
  {
    id: 'p2',
    name: '小橘',
    type: 'stray',           // 流浪救助
    typeText: '流浪救助',
    emoji: '🐈',
    color: '#F47521',
    avatar: '',
    species: '中华田园橘猫',
    gender: '妹妹',
    ageText: '约 1 岁',
    birthday: '2025-09-01',
    weight: 3.2,
    hobbies: '警惕但嘴馋，熟悉后会翻肚皮',
    favoriteFood: '猫粮、小鱼干',
    sterilized: false,
    vaccinated: false,
    intro: '小区里的流浪小橘，正在等待领养，已完成驱虫，可亲可撸。',
    tags: ['待领养', '已驱虫'],
    lost: false,
    coverGradient: 'linear-gradient(135deg,#FFE3A9,#FFC46B)',
    kind: 'cat',
    breed: '中华田园橘猫',
    noFoods: '未确认，暂不喂人食',
    notes: '警惕性强，靠近请放慢动作；体内外驱虫已做',
    story: '救助第 67 天。从最初见到人就跑，到现在会主动蹭手、翻肚皮，小橘慢慢相信人类了。希望有缘人能给它一个安稳的家。',
    friends: [{ id: 'f1', name: '团子', emoji: '🐱', color: '#FF9F4A' }],
    members: [
      { id: 'u1', name: '小喵', role: 'admin', avatar: '', color: '#FF9F4A' },
      { id: 'u4', name: '流浪救助站', role: 'member', avatar: '', color: '#E4572E' }
    ]
  },
  {
    id: 'p3',
    name: '旺财',
    type: 'home',
    typeText: '家养宠物',
    emoji: '🐶',
    color: '#E8A13C',
    avatar: '',
    species: '柯基',
    gender: '弟弟',
    ageText: '3 岁',
    birthday: '2023-08-15',
    weight: 12.5,
    hobbies: '追球、游泳、拆家前会先看你脸色',
    favoriteFood: '牛肉粒、苹果',
    sterilized: true,
    vaccinated: true,
    intro: '电臀小短腿，下楼遛弯是每天的必修课。',
    tags: ['拆家队长'],
    lost: false,
    coverGradient: 'linear-gradient(135deg,#FCD9A0,#E8A13C)',
    kind: 'dog',
    breed: '柯基犬',
    noFoods: '葡萄、洋葱、巧克力',
    notes: '髋关节注意控制体重，上下楼尽量抱着；夏天避免高温遛狗',
    story: '3 岁的拆家小队长。虽然爱咬拖鞋，但每次我难过它都会安静趴在我脚边。带它去滨江公园跑步是我们每周最开心的事。',
    friends: [{ id: 'f3', name: '球球', emoji: '🐩', color: '#7BA05B' }],
    members: [
      { id: 'u5', name: '阿哲', role: 'admin', avatar: '', color: '#F2B04C' }
    ]
  }
];

// 成长记录（按时间升序）
const growths = {
  p1: [
    { id: 'g1', petId: 'p1', time: '2024-05-20 10:00', photo: '', note: '第一天回家，小小一只', location: '宠物店' },
    { id: 'g2', petId: 'p1', time: '2024-06-01 14:20', photo: '', note: '满月啦！学会用猫砂盆', location: '家里' },
    { id: 'g3', petId: 'p1', time: '2024-12-25 09:30', photo: '', note: '第一次洗澡，变成落汤喵', location: '宠物美容店' },
    { id: 'g4', petId: 'p1', time: '2025-05-20 18:00', photo: '', note: '一岁生日，吃到了小鱼干蛋糕', location: '家里' },
    { id: 'g5', petId: 'p1', time: '2026-08-30 16:40', photo: '', note: '学会握手啦（为了零食）', location: '家里' }
  ],
  p2: [
    { id: 'g6', petId: 'p2', time: '2026-07-02 08:00', photo: '', note: '第一次在小区喂到它，很瘦很怕人', location: '小区南门' },
    { id: 'g7', petId: 'p2', time: '2026-08-18 19:30', photo: '', note: '会主动蹭手了，驱虫完成', location: '小区花园' }
  ],
  p3: [
    { id: 'g8', petId: 'p3', time: '2023-08-15 11:00', photo: '', note: '接回家的第一天', location: '机场' },
    { id: 'g9', petId: 'p3', time: '2026-06-01 10:00', photo: '', note: '公园撒欢跑', location: '滨江公园' }
  ]
};

// 轨迹打卡记录
const tracks = {
  p1: [
    { id: 't1', petId: 'p1', time: '2026-09-05 08:12', location: '金桂小区·花园', address: '幸福路 88 号', lat: 31.2304, lng: 121.4737, note: '晨间巡逻，抓到了一只小飞虫', type: 'play' },
    { id: 't2', petId: 'p1', time: '2026-09-05 18:30', location: '金桂小区·南门', address: '幸福路 88 号', lat: 31.2291, lng: 121.4742, note: '等奶爸下班，蹲在门口', type: 'wait' },
    { id: 't3', petId: 'p1', time: '2026-09-06 09:00', location: '喵星人宠物医院', address: '朝阳路 12 号', lat: 31.2330, lng: 121.4701, note: '打疫苗，全程惨叫但没跑', type: 'medical' },
    { id: 't4', petId: 'p1', time: '2026-09-06 20:00', location: '金桂小区·花园', address: '幸福路 88 号', lat: 31.2304, lng: 121.4737, note: '和楼下小橘对峙 3 分钟', type: 'play' }
  ],
  p2: [
    { id: 't5', petId: 'p2', time: '2026-09-06 07:40', location: '金桂小区·花园', address: '幸福路 88 号', lat: 31.2306, lng: 121.4740, note: '定点投喂，吃完就溜', type: 'feed' },
    { id: 't6', petId: 'p2', time: '2026-09-07 07:35', location: '金桂小区·南门', address: '幸福路 88 号', lat: 31.2291, lng: 121.4742, note: '今天肯让摸两下了！', type: 'feed' }
  ],
  p3: [
    { id: 't7', petId: 'p3', time: '2026-09-05 07:30', location: '滨江公园', address: '滨江大道 1 号', lat: 31.2250, lng: 121.4900, note: '晨跑，追了 5 只鸽子', type: 'walk' },
    { id: 't8', petId: 'p3', time: '2026-09-06 19:00', location: '滨江公园·草坪', address: '滨江大道 1 号', lat: 31.2245, lng: 121.4895, note: '晚风散步，遇到好朋友', type: 'walk' }
  ]
};

// 投喂计划与记录
const feeds = {
  p1: {
    plans: [
      { id: 'fp1', petId: 'p1', time: '08:00', content: '猫粮 30g', notify: true },
      { id: 'fp2', petId: 'p1', time: '18:00', content: '猫粮 30g + 鸡胸肉 10g', notify: true }
    ],
    records: [
      { id: 'fr1', petId: 'p1', date: '2026-09-07', time: '08:02', user: '小喵', content: '猫粮 30g', status: 'done' },
      { id: 'fr2', petId: 'p1', date: '2026-09-06', time: '18:05', user: '奶爸', content: '猫粮 30g + 鸡胸肉', status: 'done' },
      { id: 'fr3', petId: 'p1', date: '2026-09-06', time: '08:00', user: '小喵', content: '猫粮 30g', status: 'done' }
    ]
  },
  p2: {
    plans: [
      { id: 'fp3', petId: 'p2', time: '07:30', content: '流浪猫粮 40g', notify: true },
      { id: 'fp4', petId: 'p2', time: '19:30', content: '流浪猫粮 40g + 水', notify: false }
    ],
    records: [
      { id: 'fr4', petId: 'p2', date: '2026-09-07', time: '07:35', user: '小喵', content: '流浪猫粮 40g', status: 'done' },
      { id: 'fr5', petId: 'p2', date: '2026-09-06', time: '19:28', user: '救助站志愿者', content: '流浪猫粮 40g', status: 'done' }
    ]
  },
  p3: {
    plans: [
      { id: 'fp5', petId: 'p3', time: '07:00', content: '狗粮 150g', notify: true },
      { id: 'fp6', petId: 'p3', time: '18:30', content: '狗粮 120g + 钙片', notify: true }
    ],
    records: [
      { id: 'fr6', petId: 'p3', date: '2026-09-07', time: '07:05', user: '阿哲', content: '狗粮 150g', status: 'done' }
    ]
  }
};

// 健康记录
const healths = {
  p1: {
    vaccines: [
      { id: 'v1', petId: 'p1', name: '猫三联（第 3 针）', date: '2025-05-20', nextDate: '2026-05-20', hospital: '喵星人宠物医院' },
      { id: 'v2', petId: 'p1', name: '狂犬疫苗', date: '2025-05-20', nextDate: '2026-09-10', hospital: '喵星人宠物医院' }
    ],
    deworm: [
      { id: 'd1', petId: 'p1', type: '体内驱虫', date: '2026-08-01', nextDate: '2026-11-01' },
      { id: 'd2', petId: 'p1', type: '体外驱虫', date: '2026-08-01', nextDate: '2026-10-01' }
    ],
    checks: [
      { id: 'c1', petId: 'p1', date: '2026-05-20', org: '喵星人宠物医院', result: '体检结果良好，各项指标正常', note: '建议控制零食，体重略超标准线' }
    ]
  },
  p2: {
    vaccines: [],
    deworm: [
      { id: 'd3', petId: 'p2', type: '体内驱虫', date: '2026-08-18', nextDate: '2026-11-18' }
    ],
    checks: [
      { id: 'c2', petId: 'p2', date: '2026-08-18', org: '阳光流浪动物救助站', result: '体况偏瘦，耳螨已治愈', note: '需加强营养，计划领养后接种疫苗' }
    ]
  },
  p3: {
    vaccines: [
      { id: 'v3', petId: 'p3', name: '狂犬疫苗', date: '2026-06-01', nextDate: '2027-06-01', hospital: '爱宠康宠物医院' }
    ],
    deworm: [
      { id: 'd4', petId: 'p3', type: '体内外同驱', date: '2026-08-10', nextDate: '2026-11-10' }
    ],
    checks: [
      { id: 'c3', petId: 'p3', date: '2026-06-01', org: '爱宠康宠物医院', result: '健康，关节发育良好', note: '控制体重，避免髋关节压力过大' }
    ]
  }
};

// 体重记录（按日期升序）
const weights = {
  p1: [
    { id: 'w1', date: '2025-05-20', weight: 3.8 },
    { id: 'w2', date: '2025-08-20', weight: 4.1 },
    { id: 'w3', date: '2025-12-20', weight: 4.3 },
    { id: 'w4', date: '2026-03-20', weight: 4.5 },
    { id: 'w5', date: '2026-05-20', weight: 4.7 },
    { id: 'w6', date: '2026-07-20', weight: 4.6 },
    { id: 'w7', date: '2026-09-05', weight: 4.6 }
  ],
  p2: [
    { id: 'w8', date: '2026-07-02', weight: 2.1 },
    { id: 'w9', date: '2026-08-02', weight: 2.6 },
    { id: 'w10', date: '2026-09-02', weight: 3.2 }
  ],
  p3: [
    { id: 'w11', date: '2026-03-01', weight: 11.8 },
    { id: 'w12', date: '2026-05-01', weight: 12.1 },
    { id: 'w13', date: '2026-07-01', weight: 12.6 },
    { id: 'w14', date: '2026-09-01', weight: 12.5 }
  ]
};

// 社区动态
const moments = [
  {
    id: 'm1', petId: 'p1', petName: '团子', petEmoji: '🐱', author: '小喵', authorColor: '#FF9F4A',
    time: '2026-09-07 08:30', text: '早起第一件事不是吃饭，是先巡视它的领地 🐾', images: [], likes: 26, liked: false,
    comments: [
      { user: '奶爸', text: '猫主子日常：先巡逻后干饭' },
      { user: '外婆', text: '太可爱了，多拍点！' }
    ]
  },
  {
    id: 'm2', petId: 'p2', petName: '小橘', petEmoji: '🐈', author: '流浪救助站', authorColor: '#E4572E',
    time: '2026-09-06 20:10', text: '小橘今天第一次主动蹭人！救助第 67 天，越来越亲人，继续寻找温暖的家 🏠', images: [], likes: 118, liked: false,
    comments: [
      { user: '阿哲', text: '看眼神就知道是个好孩子' },
      { user: '小喵', text: '加油小橘！' }
    ]
  },
  {
    id: 'm3', petId: 'p3', petName: '旺财', petEmoji: '🐶', author: '阿哲', authorColor: '#F2B04C',
    time: '2026-09-05 19:00', text: '今天在公园学会了"等"指令，奖励一根牛肉棒！训狗秘诀就是零食到位 🦴', images: [], likes: 45, liked: false,
    comments: [
      { user: '小喵', text: '旺财真的聪明' }
    ]
  },
  {
    id: 'm4', petId: 'p1', petName: '团子', petEmoji: '🐱', author: '奶爸', authorColor: '#7BA05B',
    time: '2026-09-03 22:00', text: '深夜放毒：团子的三文鱼加餐，光盘行动第一名 🍣', images: [], likes: 32, liked: false,
    comments: []
  },
  {
    id: 'm5', petId: null, petName: null, petEmoji: '📚', author: '金喵小编', authorColor: '#F47521',
    time: '2026-09-02 12:00', text: '科普时间：猫咪换粮一定要遵循 7 日换粮法，否则容易软便哦。详情见知识库《科学换粮指南》', images: [], likes: 66, liked: false,
    comments: []
  }
];

// 知识库文章
const knowledge = [
  {
    id: 'k1', category: '科学喂养', title: '7 日换粮法：让猫咪平稳过渡新猫粮', summary: '突然换粮易引起肠胃不适，学会渐进式换粮，保护毛孩子的肠胃。',
    read: 3280, collected: false, tags: ['猫咪', '换粮'], content: '……（正文内容，正式版接入文章详情）'
  },
  {
    id: 'k2', category: '科学喂养', title: '不同年龄猫咪的喂养指南', summary: '幼猫、成猫、老年猫的营养需求差异很大，一篇文章讲清楚。', read: 2156, collected: true, tags: ['猫咪', '喂养指南']
  },
  {
    id: 'k3', category: '常见疾病护理', title: '猫咪软便腹泻怎么办？先别慌', summary: '从原因排查到居家护理，教你在家判断是否需要去医院。', read: 4120, collected: false, tags: ['肠胃', '护理']
  },
  {
    id: 'k4', category: '常见疾病护理', title: '狗狗中暑急救指南（夏季必看）', summary: '狗狗散热能力差，中暑致死率高，掌握黄金急救 5 步。', read: 5600, collected: false, tags: ['狗狗', '急救']
  },
  {
    id: 'k5', category: '行为训练', title: '三招教会狗狗"坐下"和"握手"', summary: '正向激励训练法，零食到位，狗狗配合。', read: 1980, collected: false, tags: ['狗狗', '训练']
  },
  {
    id: 'k6', category: '行为训练', title: '猫咪乱抓家具？试试这些纠正方法', summary: '了解猫咪磨爪本能，用猫抓板正确引导。', read: 2630, collected: false, tags: ['猫咪', '行为']
  },
  {
    id: 'k7', category: '宠物用品推荐', title: '养猫必买清单：新手避坑指南', summary: '从猫砂盆到饮水机，哪些值得买哪些是智商税？', read: 8860, collected: false, tags: ['清单', '新手']
  },
  {
    id: 'k8', category: '宠物用品推荐', title: '高性价比猫粮测评（2026 更新）', summary: '结合成分表与适口性，多款平价猫粮横向对比。', read: 7310, collected: false, tags: ['猫粮', '测评']
  }
];

// 附近服务
const nearby = [
  { id: 'n1', name: '喵星人宠物医院', type: '宠物医院', distance: '350m', hours: '08:30-21:00', phone: '021-6888 1234', lat: 31.2310, lng: 121.4720, rating: 4.9, tags: ['24h急诊', '疫苗'], color: '#E4572E' },
  { id: 'n2', name: '爱宠康宠物医院', type: '宠物医院', distance: '1.2km', hours: '09:00-20:00', phone: '021-6888 5678', lat: 31.2400, lng: 121.4780, rating: 4.8, tags: ['绝育', '内科'], color: '#E4572E' },
  { id: 'n3', name: '毛孩子美容屋', type: '宠物店', distance: '800m', hours: '10:00-19:00', phone: '021-6888 9012', lat: 31.2350, lng: 121.4760, rating: 4.7, tags: ['洗护', '美容'], color: '#FF9F4A' },
  { id: 'n4', name: '爪爪宠物生活馆', type: '宠物店', distance: '2.0km', hours: '09:30-21:30', phone: '021-6888 3456', lat: 31.2200, lng: 121.4850, rating: 4.6, tags: ['用品', '寄养'], color: '#FF9F4A' },
  { id: 'n5', name: '滨江宠物公园', type: '宠物公园', distance: '1.6km', hours: '全天开放', phone: '', lat: 31.2250, lng: 121.4900, rating: 4.9, tags: ['草坪', '遛狗'], color: '#7BA05B' },
  { id: 'n6', name: '金桂小区宠物角', type: '宠物公园', distance: '200m', hours: '全天开放', phone: '', lat: 31.2304, lng: 121.4737, rating: 4.5, tags: ['社区活动区'], color: '#7BA05B' }
];


// ===== 附近可见的宠物（流浪动物/他人家养宠物，演示数据） =====
const nearbyPets = [
  {
    id: 'np1', name: '小白', kind: 'cat', emoji: '🐱', color: '#F47521',
    species: '中华田园猫', gender: '妹妹', ageText: '约 2 岁',
    location: '金桂小区·北门', address: '幸福路 88 号', lat: 31.2312, lng: 121.4740,
    distance: '180m', typeText: '流浪救助', intro: '白猫小公主，亲人但怕狗，正在找家。',
    tags: ['待领养', '已绝育'], feedTimes: '07:40 / 19:30'
  },
  {
    id: 'np2', name: '阿黄', kind: 'dog', emoji: '🐶', color: '#E8A13C',
    species: '中华田园犬', gender: '弟弟', ageText: '约 3 岁',
    location: '滨江公园·草坪', address: '滨江大道 1 号', lat: 31.2250, lng: 121.4900,
    distance: '1.6km', typeText: '流浪救助', intro: '性格温顺，会作揖，常在公园等投喂。',
    tags: ['待领养', '已驱虫'], feedTimes: '18:00'
  },
  {
    id: 'np3', name: '布丁', kind: 'cat', emoji: '🐱', color: '#FF9F4A',
    species: '英国短毛猫', gender: '妹妹', ageText: '1 岁 2 个月',
    location: '金桂小区·8 栋', address: '幸福路 88 号 8 栋', lat: 31.2298, lng: 121.4731,
    distance: '260m', typeText: '家养宠物', intro: '爱晒太阳的小胖猫，主人希望它多交朋友。',
    tags: ['家养', '可交友'], feedTimes: '08:00 / 18:00'
  },
  {
    id: 'np4', name: '煤球', kind: 'dog', emoji: '🐕', color: '#8C5A2B',
    species: '柴犬', gender: '弟弟', ageText: '2 岁',
    location: '幸福公园', address: '幸福路 200 号', lat: 31.2330, lng: 121.4800,
    distance: '900m', typeText: '家养宠物', intro: '社牛柴犬，喜欢和同类玩耍。',
    tags: ['家养', '可交友'], feedTimes: '07:30 / 17:30'
  }
];

// ===== 宠物商家（入驻店铺）与评分评价 =====
const shops = [
  {
    id: 's1', name: '喵星人宠物医院', logo: '🏥', color: '#E4572E',
    category: '宠物医院', status: 'verified',   // verified 已认证 / reviewing 审核中 / rejected 未通过
    address: '朝阳路 12 号', distance: '350m', lat: 31.2310, lng: 121.4720,
    phone: '021-6888 1234', hours: '08:30-21:00', rating: 4.9, scoreCount: 128,
    tags: ['24h急诊', '疫苗', '绝育'], intro: '营业 8 年的社区宠物医院，医师团队持证上岗，设有独立猫狗诊区。',
    owner: '王医生', certify: { license: true, idcard: true },
    service: ['疫苗接种', '绝育手术', '体检', '内科诊疗']
  },
  {
    id: 's2', name: '毛孩子美容屋', logo: '🛁', color: '#FF9F4A',
    category: '宠物店', status: 'verified',
    address: '幸福路 66 号', distance: '800m', lat: 31.2350, lng: 121.4760,
    phone: '021-6888 9012', hours: '10:00-19:00', rating: 4.7, scoreCount: 86,
    tags: ['洗护', '美容', '寄养'], intro: '主打宠物洗护美容，使用温和低敏洗护产品，全程视频可看。',
    owner: '阿圆', certify: { license: true, idcard: true },
    service: ['洗澡', '造型', 'SPA', '寄养']
  },
  {
    id: 's3', name: '爪爪宠物生活馆', logo: '🛍️', color: '#F2B04C',
    category: '宠物店', status: 'verified',
    address: '滨江路 88 号', distance: '2.0km', lat: 31.2200, lng: 121.4850,
    phone: '021-6888 3456', hours: '09:30-21:30', rating: 4.6, scoreCount: 64,
    tags: ['用品', '食品', '零食'], intro: '甄选进口与国货宠物粮，提供营养师一对一咨询。',
    owner: '陈掌柜', certify: { license: true, idcard: true },
    service: ['宠物粮', '零食', '玩具', '营养咨询']
  }
];

// 商家评价（含评分维度与图文）
const reviews = {
  s1: [
    { id: 'r1', user: '小喵', avatarColor: '#FF9F4A', time: '2026-09-02', score: 5, text: '医生很耐心，团子打疫苗全程被安抚得很好，环境也干净。', tags: ['服务好', '很专业'] },
    { id: 'r2', user: '奶爸', avatarColor: '#7BA05B', time: '2026-08-18', score: 5, text: '夜里急诊也接诊，救了我们家猫一命，感恩！', tags: ['24h值班'] },
    { id: 'r3', user: '豆豆妈', avatarColor: '#F2B04C', time: '2026-08-02', score: 4, text: '排队稍久，但医生负责，会详细说明病因。', tags: ['人有点多'] }
  ],
  s2: [
    { id: 'r4', user: '阿哲', avatarColor: '#E8A13C', time: '2026-08-28', score: 5, text: '旺财洗完澡香喷喷，造型师还会教在家梳毛。', tags: ['洗得干净'] },
    { id: 'r5', user: '小喵', avatarColor: '#FF9F4A', time: '2026-07-30', score: 4, text: '寄养很放心，每天发照片视频。', tags: ['有视频'] }
  ],
  s3: [
    { id: 'r6', user: '外婆', avatarColor: '#7BA05B', time: '2026-08-10', score: 5, text: '老板娘很懂猫粮，按我家猫肠胃推荐的粮很合适。', tags: ['专业'] }
  ]
};

// 商家入驻申请记录（演示：当前用户尚未申请；申请后写入缓存）
const initialMerchantApp = null;

module.exports = { pets, growths, tracks, feeds, healths, weights, moments, knowledge, nearby, nearbyPets, shops, reviews, initialMerchantApp };
