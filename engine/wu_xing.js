/**
 * 五行生克与天干地支工具
 */

const ELEMENT_CYCLE = {
  // 相生
  generate: {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  },
  // 相克
  overcome: {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
  }
};

// 天干五行属性
const STEM_ELEMENT = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支五行属性
const BRANCH_ELEMENT = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水'
};

// 六神起始表：根据日干确定初爻六神
const LIU_SHEN_START = {
  '甲': '青龙', '乙': '青龙',
  '丙': '朱雀', '丁': '朱雀',
  '戊': '勾陈',
  '己': '腾蛇',
  '庚': '白虎', '辛': '白虎',
  '壬': '玄武', '癸': '玄武'
};

// 六神顺序（循环）
const LIU_SHEN_ORDER = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];

/**
 * 根据日干获取六爻六神排列
 * @param {string} dayStem - 日干（如'甲'）
 * @returns {Array<string>} [初爻,...,上爻]
 */
function getLiuShen(dayStem) {
  const start = LIU_SHEN_START[dayStem];
  if (!start) return null;
  const startIdx = LIU_SHEN_ORDER.indexOf(start);
  const result = [];
  for (let i = 0; i < 6; i++) {
    result.push(LIU_SHEN_ORDER[(startIdx + i) % 6]);
  }
  return result;
}

/**
 * 根据地支确定五行
 */
function getBranchElement(zhi) {
  return BRANCH_ELEMENT[zhi] || null;
}

/**
 * 排六亲：以卦宫五行为"我"，各爻地支五行与"我"的关系
 * @param {string} palaceElement - 卦宫五行
 * @param {Array<string>} earthlyBranches - 各爻地支 ['子','寅','辰',...]
 * @returns {Array<string>} 六亲名 [初爻,...,上爻]
 */
function getLiuQin(palaceElement, earthlyBranches) {
  // 六亲确定（以宫位五行为"我"）
  return earthlyBranches.map(zhi => {
    const branchEl = getBranchElement(zhi);
    if (!branchEl) return '未知';
    if (branchEl === palaceElement) return '兄弟';    // 同我
    if (ELEMENT_CYCLE.generate[palaceElement] === branchEl) return '子孙';     // 我生
    if (ELEMENT_CYCLE.generate[branchEl] === palaceElement) return '父母';     // 生我
    if (ELEMENT_CYCLE.overcome[palaceElement] === branchEl) return '妻财';     // 我克
    if (ELEMENT_CYCLE.overcome[branchEl] === palaceElement) return '官鬼';     // 克我
    return '未知';
  });
}

/**
 * 解析干支字符串（如'甲子'）为天干和地支
 */
function parseGanZhi(ganZhi) {
  const gan = ganZhi[0];
  const zhi = ganZhi.slice(1);
  return { gan, zhi };
}

/**
 * 判断日干
 * 简化版：仅提取天干
 */
function getDayStem(ganZhi) {
  if (!ganZhi || ganZhi.length < 2) return null;
  return ganZhi[0];
}

module.exports = {
  ELEMENT_CYCLE,
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  LIU_SHEN_ORDER,
  getLiuShen,
  getBranchElement,
  getLiuQin,
  parseGanZhi,
  getDayStem
};
