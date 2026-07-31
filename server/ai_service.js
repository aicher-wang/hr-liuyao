/**
 * AI 解卦服务 - 只使用普通字符串，避免模板转义问题
 */
const DEFAULT_MODEL = 'deepseek-v4-flash';

async function callAI(messages, options) {
  options = options || {};
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return null;

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
      }
    }, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() {
        if (res.statusCode >= 400) {
          reject(new Error(res.statusCode + ' ' + d));
        } else {
          try {
            var j = JSON.parse(d);
            var c = j.choices && j.choices[0] && j.choices[0].message;
            resolve(c ? (c.content || '').trim() : null);
          } catch(e) {
            reject(new Error('Parse error'));
          }
        }
      });
    });
    r.on('error', reject);
    r.write(buf);
    r.end();
  });
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

// ===== 初始解卦 =====
async function getDivineReading(bagua, question, options) {
  options = options || {};
  var text = buildText(bagua, question);
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return 'AI 解读需要配置 API Key。';

  var sys = '你是一位精通京房易/火珠林体系的六爻解卦师。';

  sys += '你的任务是：看到用户的HR问题，结合六爻排盘数据，严格围绕用户的具体问题进行解读。';
  sys += '用户问什么，你就回答什么。例如用户问候选人是否接受offer，你就分析候选人意向强弱。';
  sys += '用户问离职面谈怎么切入，你就分析对方真实想法和策略。';
  sys += '每一句卦理分析都要回扣到用户的问题，不要写通用模板。';

  sys += '输出格式（严格按此）：';
  sys += '【总体判断】直接用一句话回答用户的问题。然后空一行写2-3句话给出核心依据。';
  sys += '【卦象详解】每一项都要关联用户问题：';
  sys += '1.本卦分析：卦名大象对当前问题的指向';
  sys += '2.世应关系：世爻代表你方，应爻代表对方，看生克对问题的影响';
  sys += '3.用神定位：结合问题指出关键用神';
  sys += '4.动爻分析：动爻带来什么变化';
  sys += '5.变卦分析：发展趋势';
  sys += '【建议】结合卦象给出针对性的行动建议，分点列出';
  sys += '【免责】--- 以上解读基于传统六爻理论，仅供参考';
  sys += '要求：语气专业理性，总体判断放在最前面加粗突出。';

  sys += '铁律：每一条解读都要与用户问题关联，不确定某条卦理对问题的意义就不写。';

  try {
    var result = await callAI([
      { role: 'system', content: sys },
      { role: 'user', content: '请解读以下六爻排盘，紧扣我的问题：\n\n' + text }
    ], { temperature: 0.7, maxTokens: 4000 });
    return result || '解读生成失败';
  } catch (err) {
    console.error('AI reading error:', err.message);
    return 'AI 解读出错：' + err.message;
  }
}

// ===== 追问 =====
async function getFollowupReading(bagua, history, followup, options) {
  options = options || {};
  var text = buildText(bagua, '');
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return 'AI 追问需要配置 API Key。';

  var sys = '你是一位六爻解卦师。用户在已有解读基础上继续追问。';
  sys += '规则：基于同一卦象，不重复已有内容，从追问角度深入分析。';
  sys += '末尾标注：以上解读基于传统六爻理论，仅供参考。';

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
    return '追问出错：' + err.message;
  }
}

// ===== 补全问题 =====
async function refineQuestion(question, options) {
  options = options || {};
  var apiKey = options.apiKey || process.env.AI_API_KEY;
  if (!apiKey) return null;

  var sys = '你是六爻占卜的问题顾问。';
  sys += '用户的问题太宽泛时，改写成具体可问的HR问题。';
  sys += '规则：补全时间/对象/场景要素，只输出一行改写后的问题。';
  sys += '如果已足够具体，直接返回原问题。';

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

module.exports = { getDivineReading, getFollowupReading, buildDivinationText: buildText, refineQuestion };
