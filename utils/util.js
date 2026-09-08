/**
 * 工具函数
 */
const pad = n => (n < 10 ? '0' + n : '' + n);

// 格式化日期 yyyy-MM-dd
function formatDate(date, sep = '-') {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}${sep}${pad(d.getMonth() + 1)}${sep}${pad(d.getDate())}`;
}

// 格式化日期时间
function formatDateTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 距今文案：刚刚 / x分钟前 / x小时前 / x天前 / 日期
function fromNow(dateStr) {
  const t = new Date(dateStr.replace(/-/g, '/')).getTime();
  const diff = Date.now() - t;
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 3600 * 1000) return Math.floor(diff / 60000) + ' 分钟前';
  if (diff < 86400 * 1000) return Math.floor(diff / 3600000) + ' 小时前';
  if (diff < 7 * 86400 * 1000) return Math.floor(diff / 86400000) + ' 天前';
  return formatDate(dateStr);
}

// 近期体重预警文案
function weightTrend(records) {
  if (!records || records.length < 2) return { level: 'normal', text: '数据太少，暂无法评估趋势' };
  const last = records[records.length - 1];
  const prev = records[records.length - 2];
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

module.exports = { formatDate, formatDateTime, fromNow, weightTrend, pad };
