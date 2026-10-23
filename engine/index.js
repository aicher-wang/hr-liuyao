/**
 * 六爻排盘主引擎
 * 
 * 输入：六次摇钱结果 + 问题 + 日干
 * 输出：完整的六爻排盘数据（本卦、变卦、六亲、六神、世应、动爻）
 */

const bagua64 = require('./bagua64');
const { judgeAllCoins, getHexagramCode, getChangedHexagramCode } = require('./yin_yang');
const { getLiuShen, parseGanZhi, getBranchElement, getLiuQin } = require('./wu_xing');

/**
 * 根据六线代码查找卦名
 * @param {string} code - 6位01字符串，如'011111'
 * @returns {object|null} 卦对象
 */
function findGuaByCode(code) {
  // 本卦没有直接的二进制码匹配，我们需要通过上下卦来匹配
  // 上卦 = 上三爻（code的后3位），下卦 = 下三爻（code的前3位）
  const top = code.slice(3);  // 4,5,6爻
  const bottom = code.slice(0, 3);  // 1,2,3爻

  const topTrigram = getTrigramByCode(top);
  const bottomTrigram = getTrigramByCode(bottom);

  return bagua64.find(g => 
    g.trigramTop === topTrigram && g.trigramBottom === bottomTrigram
  ) || null;
}

/**
 * 三爻 → 八卦名
 */
function getTrigramByCode(code) {
  const map = {
    '111': '乾', '110': '兑', '101': '离', '100': '震',
    '011': '巽', '010': '坎', '001': '艮', '000': '坤'
  };
  return map[code] || null;
}

/**
 * 单卦的五行属性
 */
const TRIGRAM_ELEMENT = {
  '乾': '金', '兑': '金',
  '离': '火',
  '震': '木', '巽': '木',
  '坎': '水',
  '艮': '土', '坤': '土'
};

/**
 * 主排盘函数
 * @param {Array<[number,number,number]>} coinResults - 6组铜钱结果
 * @param {string} dayGanZhi - 起卦日干支（如'甲子'）
 * @returns {object} 完整排盘
 */
function createDivination(coinResults, dayGanZhi) {
  // 1. 判定阴阳
  const lines = judgeAllCoins(coinResults);
  const benGuaCode = getHexagramCode(lines);
  const bianGuaCode = getChangedHexagramCode(lines);

  // 2. 查找本卦和变卦
  const benGua = findGuaByCode(benGuaCode);
  const bianGua = findGuaByCode(bianGuaCode);

  if (!benGua) throw new Error(`Cannot find hexagram for code: ${benGuaCode}`);

  // 3. 提取日干
  const dayStem = dayGanZhi ? dayGanZhi[0] : '甲';

  // 4. 排六神
  const liushen = getLiuShen(dayStem);

  // 5. 排六亲
  const branches = benGua.earthlyBranches.map(gz => parseGanZhi(gz).zhi);
  const liuqin = getLiuQin(benGua.element, branches);

  // 6. 构建各爻完整数据
  const benGuaLines = lines.map((line, i) => {
    const gz = benGua.earthlyBranches[i];
    const { gan, zhi } = parseGanZhi(gz);
    return {
      position: i + 1,
      yao: line.yao,
      type: line.type,
      gan: gan,
      zhi: zhi,
      element: getBranchElement(zhi) || '?',
      liuqin: liuqin[i],
      liushen: liushen[i],
      shiying: getShiYingLabel(benGua, i + 1),
      isChanging: line.isChanging,
      isDongYao: line.isChanging
    };
  });

  // 7. 构建变卦各爻
  const bianLines = bianGua ? bianGua.earthlyBranches.map((gz, i) => {
    const { gan, zhi } = parseGanZhi(gz);
    // 变卦的六神、六亲按本卦来
    return {
      position: i + 1,
      yao: lines[i].isChanging 
        ? (lines[i].value === 2 ? '⚋' : '⚊')
        : lines[i].yao,
      gan, zhi,
      element: getBranchElement(zhi) || '?',
      liuqin: liuqin[i],
      liushen: liushen[i],
      shiying: getShiYingLabel(bianGua, i + 1),
      isChanging: false
    };
  }) : [];

  // 8. 动爻
  const dongYao = lines.filter(l => l.isChanging).map(l => l.position);
  const allLinesValue = lines.map(l => l.value).join('');

  return {
    benGua: {
      name: benGua.name,
      symbol: benGua.symbol,
      trigramTop: benGua.trigramTop,
      trigramBottom: benGua.trigramBottom,
      palace: benGua.palace,
      element: benGua.element,
      judgment: benGua.judgment,
      greatImage: benGua.greatImage,
      lines: benGuaLines
    },
    // 无动爻为静卦，不生成变卦，避免前端重复展示同一卦。
    bianGua: (dongYao.length && bianGua) ? {
      name: bianGua.name,
      symbol: bianGua.symbol,
      trigramTop: bianGua.trigramTop,
      trigramBottom: bianGua.trigramBottom,
      palace: bianGua.palace,
      element: bianGua.element,
      judgment: bianGua.judgment,
      greatImage: bianGua.greatImage,
      lines: bianLines
    } : null,
    // 附加动爻信息，用于AI解读
    dongYao: dongYao,
    dongYaoCount: dongYao.length,
    allLinesValue: allLinesValue,
    // 六线格式
    benGuaCode,
    bianGuaCode,
    // 世应位置
    shiYao: benGua.shiYao,
    yingYao: benGua.yingYao
  };
}

/**
 * 获取世应标注
 */
function getShiYingLabel(gua, position) {
  if (gua.shiYao === position) return '世';
  if (gua.yingYao === position) return '应';
  return null;
}

module.exports = {
  createDivination,
  findGuaByCode,
  getTrigramByCode,
  TRIGRAM_ELEMENT
};
