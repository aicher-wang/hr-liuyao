/**
 * AI 解卦服务 - 只使用普通字符串，避免模板转义问题
 *
 * 优化点：
 *   1. AI 调用 15 秒超时 + 1 次重试
 *   2. 错误信息脱敏（不向外暴露底层错误）
 *   3. 简单内存缓存（同一卦象+问题 5 分钟内复用）
 */
const DEFAULT_MODEL = 'deepseek-v4-flash';

// ===== 内存缓存 =====
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 分钟
const CACHE_MAX_SIZE = 500;
const CACHE_CLEAN_BATCH = 100;

function getCacheKey(bagua, question) {
  var q = (question || '').trim();
  var name = bagua && bagua.benGua ? bagua.benGua.name : '';
  var dong = bagua && bagua.dongYao ? bagua.dongYao.join(',') : '';
  return q + '|' + name + '|' + dong;
}

function getCached(bagua, question) {
  var key = getCacheKey(bagua, question);
  var entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(bagua, question, value) {
  var key = getCacheKey(bagua, question);
  cache.set(key, { value: value, ts: Date.now() });
  // 简单防溢出：超限时批量删除最旧的条目
  if (cache.size > CACHE_MAX_SIZE) {
    var entries = [];
    cache.forEach(function(v, k) {
      entries.push({ key: k, ts: v.ts });
    });
    entries.sort(function(a, b) { return a.ts - b.ts; });
    var delCount = Math.min(CACHE_CLEAN_BATCH, entries.length);
    for (var i = 0; i < delCount; i++) {
      cache.delete(entries[i].key);
    }
  }
}

// ===== 底层 AI 调用（带 15 秒超时 + 1 次重试） =====
function callAIOnce(messages, options) {
  options = options || {};
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return Promise.resolve(null);

  var model = options.model || process.env.AI_MODEL || DEFAULT_MODEL;
  var baseURL = (options.baseURL || process.env.AI_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');

  var body = JSON.stringify({
    model: model,
    messages: messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000,
    stream: false
  });
  var buf = Buffer.from(body, 'utf8');

  var u = new URL(baseURL + '/chat/completions');
  var m = u.protocol === 'https:' ? require('https') : require('http');

  return new Promise(function(resolve, reject) {
    var r = m.request({
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'Content-Length': buf.length
      },
      timeout: 30000 // 30 秒超时（服务器网络环境需要更长时间）
    }, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() {
        if (res.statusCode >= 400) {
          reject(new Error('AI service returned ' + res.statusCode));
        } else {
          try {
            var j = JSON.parse(d);
            var c = j.choices && j.choices[0] && j.choices[0].message;
            resolve(c ? (c.content || '').trim() : null);
          } catch(e) {
            reject(new Error('AI response parse error'));
          }
        }
      });
    });
    r.on('timeout', function() {
      r.destroy();
      reject(new Error('AI request timeout'));
    });
    r.on('error', function(err) {
      reject(new Error('AI request failed'));
    });
    r.write(buf);
    r.end();
  });
}

async function callAI(messages, options) {
  var lastErr = null;
  for (var attempt = 0; attempt <= 1; attempt++) { // 1 次重试，共 2 次
    try {
      return await callAIOnce(messages, options);
    } catch (err) {
      lastErr = err;
      if (attempt === 0) {
        console.log('[AI] 第 1 次调用失败，准备重试:', err.message);
      }
    }
  }
  throw lastErr;
}

function buildText(bagua, question) {
  var b = bagua.benGua;
  var lines = b.lines.map(function(l) {
    var info = l.position + '爻 ' + l.yao + ' ' + l.gan + l.zhi + ' ' + l.element + ' ' + l.liuqin + ' ' + l.liushen;
    if (l.shiying) info += ' ' + l.shiying;
    if (l.isChanging) info += ' 动爻';
    return '  ' + info;
  }).join('\n');

  var t = '## 用户问题\n' + question;
  t += '\n\n## 本卦\n- 卦名：' + b.name;
  t += '\n- 卦象：' + b.symbol;
  t += '\n- 宫位：' + b.palace + '宫五行' + b.element;
  t += '\n- 卦辞：' + b.judgment;
  t += '\n- 大象：' + b.greatImage;
  t += '\n- 世爻：第' + bagua.shiYao + '爻 应爻：第' + bagua.yingYao + '爻';
  t += '\n\n## 六爻排盘（从下到上）\n' + lines;

  var dy = bagua.dongYao;
  t += '\n\n## 动爻\n';
  if (dy.length === 0) {
    t += '无动爻（静卦）';
  } else {
    t += '第' + dy.join('、第') + '爻动（共' + bagua.dongYaoCount + '爻）';
  }

  if (bagua.bianGua) {
    var v = bagua.bianGua;
    t += '\n\n## 变卦\n- 卦名：' + v.name;
    t += '\n- 卦象：' + v.symbol;
    t += '\n- 卦辞：' + v.judgment;
    t += '\n- 大象：' + v.greatImage;
  }

  return t;
}

// ===== 初始解卦（带缓存） =====
async function getDivineReading(bagua, question, options) {
  options = options || {};
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return 'AI 解读需要配置 API Key。';

  // 先查缓存
  var cached = getCached(bagua, question);
  if (cached) {
    console.log('[Cache] 命中缓存，直接返回已缓存的解读');
    return cached;
  }

  var text = buildText(bagua, question);

  var sys = '你是一位精通京房易/火珠林体系的六爻解卦师。';

  sys += '你的任务是：结合六爻排盘数据，严格围绕用户的具体问题进行解读。用户的问题可能来自事业、感情、人际、选择、出行、学业等任何生活领域。';
  sys += '用户问什么，你就回答什么。每一句卦理分析都要回扣到用户的问题，不要写通用模板。';
  sys += '如果问题涉及医疗诊断、法律判决、投资建议、生死等超出六爻适用范围的内容，先明确说明边界，再把解读落在用户可自主行动的部分。';

  sys += '输出格式（严格按此）：';
  sys += '【总体判断】直接用一句话回答用户的问题。然后空一行写2-3句话给出核心依据。';
  sys += '【卦象详解】每一项都要关联用户问题：';
  sys += '1.本卦分析：先原样引用本卦卦辞（用「」括起），再说明卦名大象对当前问题的指向';
  sys += '2.世应关系：世爻代表你方，应爻代表对方，看生克对问题的影响';
  sys += '3.用神定位：结合问题指出关键用神';
  sys += '4.动爻分析：动爻带来什么变化';
  sys += '5.变卦分析：先引用变卦卦辞（用「」括起），再说明发展趋势';
  sys += '【免责】--- 以上解读基于传统六爻理论，仅供文化研究与自我梳理，不构成医疗、法律、投资或人生决策建议。';
  sys += '要求：语气专业理性，总体判断放在最前面加粗突出。';

  sys += '铁律：每一条解读都要与用户问题关联，不确定某条卦理对问题的意义就不写。';

  // ===== 工作/人事场景：用神锚定 + 软边界 + 语言约束 =====
  sys += '用神锚定（重要）：判断一件事是不是「问自己的事」，看的是结果是否落在求测人身上、求测人在这件事上有没有行动空间，而不是看问题里出现了谁。求测人在自己的工作中问自己经手的人或事（例如自己发出的 offer、自己在推的招聘、自己要谈的面谈），都属于问自己的事，世爻仍代表求测人本人。';
  sys += '选取用神只依据所问之事落在哪个六亲，不因职业或行业另设规则：问岗位、职级、上级、官方态度取官鬼；问合同、offer、审批、文书、考核材料取父母；问同辈、竞争者、平级协作取兄弟；问下属、团队执行与产出取子孙；问薪酬、待遇、资源取妻财。';
  sys += '若一题中出现多个对象，先定主用神：以「求测人自己的行动与结果」为轴选择，其余作辅助，不要平均用力。';
  sys += '当所问之事的结果并不落在求测人身上、求测人也几乎没有行动空间时（例如某位同事私下怎么想、是否在找下家），照常解读，但落点放在求测人可以观察的信号与可以提前做的准备上，不对他人内心下断言。';
  sys += '人事边界：涉及录用、淘汰、晋升、绩效、薪酬等人事决定，或对具体他人的品行、去留、忠诚度做判断时，不给对该他人的定性结论与必然性预言，不使用「他一定会」「绝对不能」这类句式。卦象只提示倾向、风险点与需要核实的事实，解读必须落回求测人自身：我的处境是什么、我可以采取哪些行动、我需要去现实中确认什么。并明确指出卦象不能替代面试、背景调查、绩效记录与制度流程。涉及该不该的判断，把选择权交回求测人，只提供判断依据与代价，不替求测人做决定。';
  sys += '语言约束：结论使用倾向性措辞（较可能、偏弱、存在阻力），不使用确定性措辞。预测类问题照常回答走向，但最终落点收在「我在这条走向里能做什么」。';

  try {
    var result = await callAI([
      { role: 'system', content: sys },
      { role: 'user', content: '请解读以下六爻排盘，紧扣我的问题：\n\n' + text }
    ], { temperature: 0.7, maxTokens: 4000 });
    var output = result || '解读生成失败';
    setCached(bagua, question, output);
    return output;
  } catch (err) {
    console.error('AI reading error:', err.message);
    return 'AI 解读服务暂时不可用，请稍后重试。';
  }
}

// ===== 追问（带软限制） =====
async function getFollowupReading(bagua, history, followup, followupCount, options) {
  options = options || {};
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return 'AI 追问需要配置 API Key。';

  var text = buildText(bagua, '');

  var sys = '你是一位六爻解卦师。用户在已有解读基础上继续追问。';
  sys += '规则：基于同一卦象，不重复已有内容，从追问角度深入分析。';
  sys += '如果追问涉及医疗诊断、法律判决、投资建议、生死等超出六爻适用范围的内容，先说明边界。';
  sys += '追问涉及求测人自己工作中的人事（录用、淘汰、晋升、绩效、薪酬等）时，遵循与初次解读相同的锚定与边界：世爻仍是求测人本人，只按所问之事取用神；不对具体他人下定性结论或作必然性预言，把分析落回求测人自己的处境、可采取的行动与需要核实的事实；用倾向性措辞，不用确定性措辞。';
  sys += '末尾标注：以上解读基于传统六爻理论，仅供文化研究与自我梳理，不构成医疗、法律、投资或人生决策建议。';

  // 软限制：根据追问次数在 prompt 中引导
  if (followupCount >= 10) {
    sys += '【重要】用户已追问超过10次，请在本条回复末尾温和建议："同一卦象追问次数较多，建议点击「重新起卦」获取新的卦象指引。"';
  } else if (followupCount >= 5) {
    sys += '【提示】用户已多次追问，如用户的问题已偏离原卦核心或需要新的情境分析，请温和建议重新起卦。';
  }

  var msgs = [
    { role: 'system', content: sys },
    { role: 'user', content: '卦象数据（不变）：\n\n' + text }
  ];

  if (history) {
    for (var i = 0; i < history.length; i++) {
      msgs.push({ role: history[i].role === 'user' ? 'user' : 'assistant', content: history[i].content });
    }
  }
  msgs.push({ role: 'user', content: '追问：' + followup });

  try {
    var result = await callAI(msgs, { temperature: 0.7, maxTokens: 2000 });
    return result || '追问回复失败';
  } catch (err) {
    console.error('Followup error:', err.message);
    return '追问服务暂时不可用，请稍后重试。';
  }
}

// ===== 补全问题 =====
async function refineQuestion(question, options) {
  options = options || {};
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return null;

  var sys = '你是六爻占卜的问题顾问。';
  sys += '用户的问题太宽泛时，改写成具体可问的问题。';
  sys += '规则：只输出一行改写后的问题。';
  sys += '补全原则是保事件、锚主体、补要素：保住用户原本要问的那件事（预测类的问题不要改写成行动建议），补齐主体、时间、场景三个要素，并把主体锚定为「我」——即求测人自己在这件事里的处境与结果。';
  sys += '示例：「这个候选人会不会入职」应补全为「我发出 offer 的这个候选人，最终会按期入职吗」，而不是「我该怎么让他入职」。';
  sys += '不要添加用户没有提供的具体人名、承诺或事实。如果已足够具体，直接返回原问题。';

  try {
    var result = await callAI([
      { role: 'system', content: sys },
      { role: 'user', content: '补全这个问题：' + question }
    ], { temperature: 0.5, maxTokens: 200 });
    return result || null;
  } catch (err) {
    console.error('Refine error:', err.message);
    return null;
  }
}

module.exports = {
  getDivineReading,
  getFollowupReading,
  buildDivinationText: buildText,
  refineQuestion,
  // 导出缓存供外部查看/清理（可选）
  _cache: cache
};
