/**
 * 日干支计算工具
 * 根据公历日期计算天干地支（日柱）
 * 
 * 算法：基准日 2000-01-01 = 甲子日（天干0，地支0）
 */

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 2000-01-01 的儒略日
const JULIAN_2000_01_01 = 2451545;

/**
 * 计算某日期的儒略日
 * @param {Date} date 
 * @returns {number}
 */
function gregorianToJulian(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  let a = Math.floor((14 - m) / 12);
  let y2 = y + 4800 - a;
  let m2 = m + 12 * a - 3;

  let jd = d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 
           + Math.floor(y2 / 4) - Math.floor(y2 / 100) 
           + Math.floor(y2 / 400) - 32045;

  // 加0.5使偏移到正午
  jd += 0.5;
  
  return jd;
}

/**
 * 获取当天日干支
 * @param {Date} [date] - 可选，默认当天
 * @returns {{ ganZhi: string, gan: string, zhi: string }}
 */
function getDayGanZhi(date) {
  const d = date || new Date();
  
  // 计算儒略日
  const jd = gregorianToJulian(d);
  
  // 以 2000-01-01（甲子日）为基准
  const offset = Math.round(jd - JULIAN_2000_01_01);
  
  const ganIdx = ((offset % 10) + 10) % 10;
  const zhiIdx = ((offset % 12) + 12) % 12;
  
  const gan = TIAN_GAN[ganIdx];
  const zhi = DI_ZHI[zhiIdx];
  
  return { ganZhi: gan + zhi, gan, zhi, ganIdx, zhiIdx };
}

module.exports = { getDayGanZhi, TIAN_GAN, DI_ZHI };
