/**
 * 阴阳判定模块
 * 三枚铜钱掷一次 → 判定老阳/少阳/少阴/老阴
 * 
 * 输入：三个值，均为 0（字面）或 1（背面）
 * 输出：{ type, symbol, isChanging }
 */

const YIN_YANG = {
  LAO_YANG: { type: '老阳', symbol: '—', yao: '⚊', value: 2, isChanging: true },
  SHAO_YANG: { type: '少阳', symbol: '—', yao: '⚊', value: 1, isChanging: false },
  SHAO_YIN: { type: '少阴', symbol: '- -', yao: '⚋', value: 0, isChanging: false },
  LAO_YIN: { type: '老阴', symbol: '- -', yao: '⚋', value: 3, isChanging: true }
};

/**
 * 根据三枚铜钱的正反面判定阴阳
 * @param {number} c1 - 第1枚：1=背(阳面)，0=字(阴面)
 * @param {number} c2 - 第2枚
 * @param {number} c3 - 第3枚
 * @returns {object} YIN_YANG中的一项
 */
function judgeCoin(c1, c2, c3) {
  const sum = c1 + c2 + c3;
  switch (sum) {
    case 3: return { ...YIN_YANG.LAO_YANG, coins: [c1, c2, c3], count: 3 };
    case 2: return { ...YIN_YANG.SHAO_YANG, coins: [c1, c2, c3], count: 2 };
    case 1: return { ...YIN_YANG.SHAO_YIN, coins: [c1, c2, c3], count: 1 };
    case 0: return { ...YIN_YANG.LAO_YIN, coins: [c1, c2, c3], count: 0 };
    default: throw new Error(`Invalid coin sum: ${sum}`);
  }
}

/**
 * 将六次摇卦结果转化为爻数组（从下往上）
 * @param {Array<[number,number,number]>} coinResults - 6组三枚铜钱结果，第0组=初爻
 * @returns {Array<object>} 6个爻，每个含 position/type/symbol/yao/isChanging 等
 */
function judgeAllCoins(coinResults) {
  if (coinResults.length !== 6) throw new Error('Need exactly 6 coin throws');
  return coinResults.map((coins, i) => ({
    position: i + 1,       // 1=初爻, 6=上爻
    ...judgeCoin(coins[0], coins[1], coins[2])
  }));
}

/**
 * 从爻数组生成本卦六线（用于确定卦名）
 * @param {Array<object>} lines - judgeAllCoins 的输出
 * @returns {string} 6位字符串，从初爻到上爻，每位：0=阴,1=阳
 */
function getHexagramCode(lines) {
  return lines.map(l => l.value === 1 || l.value === 2 ? '1' : '0').join('');
}

/**
 * 从爻数组生成变卦六线（老阳变阴，老阴变阳）
 */
function getChangedHexagramCode(lines) {
  return lines.map(l => {
    if (l.isChanging) {
      // 老阳(2)变阴(0)，老阴(3)变阳(1)
      return l.value === 2 ? '0' : '1';
    }
    return l.value === 1 || l.value === 2 ? '1' : '0';
  }).join('');
}

module.exports = {
  YIN_YANG,
  judgeCoin,
  judgeAllCoins,
  getHexagramCode,
  getChangedHexagramCode
};
