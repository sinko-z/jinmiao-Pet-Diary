/**
 * 工具函数
 */
const pad = n => (n < 10 ? '0' + n : '' + n);

// 统一日期解析：兼容 iOS 不支持 'yyyy-MM-dd HH:mm' 的情况，非法日期返回 null
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(String(value).replace(/-/g, '/'));
  return isNaN(d.getTime()) ? null : d;
}

// 格式化日期 yyyy-MM-dd
function formatDate(date, sep = '-') {
  const d = toDate(date);
  if (!d) return '';
  return `${d.getFullYear()}${sep}${pad(d.getMonth() + 1)}${sep}${pad(d.getDate())}`;
}

// 格式化日期时间 yyyy-MM-dd HH:mm
function formatDateTime(date) {
  const d = toDate(date);
  if (!d) return '';
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 距今文案：刚刚 / x分钟前 / x小时前 / x天前 / 日期
function fromNow(dateStr) {
  const d = toDate(dateStr);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 3600 * 1000) return Math.floor(diff / 60000) + ' 分钟前';
  if (diff < 86400 * 1000) return Math.floor(diff / 3600000) + ' 小时前';
  if (diff < 7 * 86400 * 1000) return Math.floor(diff / 86400000) + ' 天前';
  return formatDate(d);
}

// 根据生日计算年龄文案：x 岁 y 个月 / y 个月
function ageText(birthday) {
  const d = toDate(birthday);
  if (!d) return '年龄未知';
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  if (months < 0) return '未出生';
  if (months < 1) return '不满 1 个月';
  if (months < 12) return `${months} 个月`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} 岁 ${m} 个月` : `${y} 岁`;
}

// 近期体重预警文案
function weightTrend(records) {
  if (!records || records.length < 2) return { level: 'normal', text: '数据太少，暂无法评估趋势', diff: 0 };
  const last = records[records.length - 1];
  const prev = records[records.length - 2];
  if (!prev.weight) return { level: 'normal', text: '数据异常，暂无法评估趋势', diff: 0 };
  const diff = last.weight - prev.weight;
  const pct = Math.abs(diff / prev.weight) * 100;
  if (pct >= 10) {
    return {
      level: 'danger',
      text: diff > 0 ? `较上次骤增 ${diff.toFixed(1)}kg（+${pct.toFixed(0)}%）` : `较上次骤降 ${Math.abs(diff).toFixed(1)}kg（-${pct.toFixed(0)}%）`,
      diff
    };
  }
  return {
    level: 'normal',
    text: diff >= 0 ? `较上次 +${diff.toFixed(1)}kg` : `较上次 ${diff.toFixed(1)}kg`,
    diff
  };
}

module.exports = { formatDate, formatDateTime, fromNow, ageText, weightTrend, pad, toDate };
