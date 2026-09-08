// components/paw/paw.js —— 小爪印装饰组件
Component({
  properties: {
    size: { type: Number, value: 32 },   // rpx
    color: { type: String, value: '#F2B04C' },
    rotate: { type: Number, value: 0 }
  },
  data: {
    // 爪印由 1 个大椭圆 + 4 个小圆组成
  }
});
