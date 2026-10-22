const assert = require('assert');
const { getDayGanZhi } = require('./day_gan_zhi');
const { createDivination, findGuaByCode } = require('./index');
const bagua = require('./bagua64');

assert.strictEqual(getDayGanZhi(new Date(2000, 0, 1)).ganZhi, '戊午', '2000-01-01 应为戊午日');
assert.strictEqual(getDayGanZhi(new Date(2026, 9, 23)).ganZhi, '庚午', '2026-10-23 应为庚午日');
assert.strictEqual(getDayGanZhi(new Date(2026, 7, 10)).ganZhi, '丙辰', '2026-08-10 应为丙辰日');

const names = new Set();
for (let i = 0; i < 64; i++) {
  const code = i.toString(2).padStart(6, '0');
  const gua = findGuaByCode(code);
  assert(gua, '缺少卦: ' + code);
  names.add(gua.name);
}
assert.strictEqual(names.size, 64, '六十四卦名称必须唯一');

const staticCoins = [
  [0, 1, 1], [0, 0, 1], [1, 1, 0],
  [0, 1, 0], [1, 0, 1], [1, 1, 0]
];
const staticResult = createDivination(staticCoins, '庚午');
assert.deepStrictEqual(staticResult.dongYao, [], '该组铜钱应为静卦');
assert.strictEqual(staticResult.bianGua, null, '静卦不应生成变卦');

const changingResult = createDivination(Array(6).fill([1, 1, 1]), '庚午');
assert.strictEqual(changingResult.benGua.name, '乾为天');
assert.strictEqual(changingResult.bianGua.name, '坤为地');
assert.strictEqual(changingResult.dongYao.length, 6);

console.log('engine tests passed: day pillar / 64 hexagrams / static / all-changing');
