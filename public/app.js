/* ============================================================
   观象 · 六爻问事 — 前端交互
   ============================================================ */
(function () {
  'use strict';

  var SPLASH_KEY = 'guanxiang_splash_seen';
  var YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

  var EXAMPLES = [
    '下周三的面试，我该怎么准备？',
    '这次合作，对方会按约定推进吗？',
    '我和他最近的关系，会不会有转机？',
    '要不要接这个新机会？',
    '这趟出行会顺利吗？'
  ];

  var TOPIC_EXAMPLES = {
    '事业': '下周三的面试，我该怎么准备？',
    '感情': '我和他最近的关系，会不会有转机？',
    '人际': '这次合作，对方会按约定推进吗？',
    '选择': '要不要接这个新机会？',
    '出行': '这趟出行会顺利吗？',
    '学业': '这次考试，我该怎么调整状态？'
  };

  var state = {
    question: '',
    coins: [],
    currentThrow: 0,
    isThrowing: false,
    isDivining: false,
    isRefining: false,
    bagua: null,
    followupHistory: [],
    requestId: 0,
    refineId: 0,
    followupId: 0
  };

  var lastRefined = null;

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ===== 开屏 ===== */
  function initSplash() {
    var splash = $('splash');
    var app = $('app');
    if (!splash) {
      document.body.classList.add('is-ready');
      return;
    }

    var splashParam = new URLSearchParams(window.location.search).get('splash');
    var force = splashParam === '1';
    if (splashParam === '0') {
      splash.remove();
      document.body.classList.add('is-ready');
      return;
    }
    var seen = false;
    try {
      seen = window.sessionStorage.getItem(SPLASH_KEY) === '1';
    } catch (err) {}

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (seen && !force) {
      splash.remove();
      document.body.classList.add('is-ready');
      return;
    }

    document.body.classList.add('is-splashing');
    if (app && 'inert' in app) app.inert = true;
    splash.classList.add('is-playing');

    var ended = false;

    function endSplash() {
      if (ended) return;
      ended = true;
      splash.classList.add('is-done');
      document.body.classList.remove('is-splashing');
      document.body.classList.add('is-ready');
      if (app && 'inert' in app) app.inert = false;
      try {
        window.sessionStorage.setItem(SPLASH_KEY, '1');
      } catch (err) {}
      window.setTimeout(function () {
        if (splash.parentNode) splash.remove();
      }, 650);
    }

    window.setTimeout(endSplash, reduced ? 350 : 2900);
    splash.addEventListener('click', endSplash);

    var skip = $('splashSkip');
    if (skip) {
      skip.addEventListener('click', function (event) {
        event.stopPropagation();
        endSplash();
      });
    }

    function onKey(event) {
      if (event.key === 'Escape') {
        endSplash();
        document.removeEventListener('keydown', onKey);
      }
    }
    document.addEventListener('keydown', onKey);
  }

  /* ===== 步骤 ===== */
  function switchStep(step) {
    document.querySelectorAll('.step-content').forEach(function (el) {
      el.classList.remove('is-active');
    });

    var target = $('step' + step);
    if (target) target.classList.add('is-active');

    document.querySelectorAll('.step').forEach(function (el) {
      var s = Number(el.getAttribute('data-step'));
      el.classList.toggle('is-active', s === step);
      el.classList.toggle('is-done', s < step);
      el.setAttribute('aria-current', s === step ? 'step' : 'false');
    });
  }

  /* ===== 示例 / 话题 ===== */
  function populateExamples() {
    var row = $('examplesRow');
    if (!row) return;
    row.innerHTML = EXAMPLES.map(function (q, i) {
      return '<button class="example-btn" type="button" data-example="' + i + '">' + escapeHtml(q) + '</button>';
    }).join('');
  }

  function setExample(index) {
    var input = $('questionInput');
    var q = EXAMPLES[index];
    if (input && q) {
      input.value = q;
      input.focus();
      clearFormError();
      hideRefine();
    }
  }

  function setTopic(topic, btn) {
    document.querySelectorAll('.chip.is-active').forEach(function (el) {
      el.classList.remove('is-active');
    });
    if (btn) btn.classList.add('is-active');

    var input = $('questionInput');
    var q = TOPIC_EXAMPLES[topic];
    if (input && q) {
      var current = input.value.trim();
      var knownExample = Object.keys(TOPIC_EXAMPLES).some(function (key) {
        return TOPIC_EXAMPLES[key] === current;
      });
      if (!current || knownExample) input.value = q;
      input.focus();
      clearFormError();
    }
  }

  /* ===== 表单提示 ===== */
  function showFormError(message) {
    var el = $('formError');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
  }

  function clearFormError() {
    var el = $('formError');
    if (!el) return;
    el.textContent = '';
    el.classList.remove('is-visible');
  }

  function hideRefine() {
    var box = $('refineBox');
    var weak = $('weakHint');
    if (box) box.classList.remove('is-visible');
    if (weak) weak.classList.remove('is-visible');
    lastRefined = null;
  }

  function setButtonLoading(btn, loading, label) {
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('is-loading', loading);
    btn.textContent = label;
  }

  /* ===== 开始起卦 ===== */
  function startDivine() {
    if (state.isDivining || state.isRefining) return;

    var input = $('questionInput');
    var q = input ? input.value.trim() : '';
    if (!q) {
      showFormError('先写下你想问的事。');
      if (input) input.focus();
      return;
    }

    clearFormError();
    hideRefine();
    checkRefineBeforeStart(q);
  }

  async function checkRefineBeforeStart(text) {
    state.isRefining = true;
    var refineId = ++state.refineId;
    var startBtn = $('startBtn');
    setButtonLoading(startBtn, true, '正在看问题…');

    try {
      var res = await fetch('/api/refine-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();

      if (refineId !== state.refineId) return;

      state.isRefining = false;
      setButtonLoading(startBtn, false, '静心起卦 →');

      var refined = String(data.refined || '').trim();
      if (!refined || refined === text) {
        proceedToDivine(text);
        return;
      }

      lastRefined = refined.replace(/^[「『"']+|[」』"']+$/g, '').trim();
      var refineText = $('refineText');
      if (refineText) refineText.textContent = lastRefined;

      var weak = $('weakHint');
      if (weak) weak.classList.add('is-visible');

      var box = $('refineBox');
      if (box) {
        box.classList.add('is-visible');
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      if (refineId !== state.refineId) return;
      state.isRefining = false;
      setButtonLoading(startBtn, false, '静心起卦 →');
      proceedToDivine(text);
    }
  }

  function useRefined() {
    var input = $('questionInput');
    var value = lastRefined;
    if (value && input) input.value = value;
    hideRefine();
    var text = input ? input.value.trim() : '';
    if (text) proceedToDivine(text);
  }

  function dismissRefine() {
    hideRefine();
    var input = $('questionInput');
    var text = input ? input.value.trim() : '';
    if (text) proceedToDivine(text);
  }

  function proceedToDivine(q) {
    if (!q) return;

    state.isDivining = true;
    state.isRefining = false;
    state.question = q;
    state.coins = [];
    state.currentThrow = 0;
    state.isThrowing = false;
    state.bagua = null;
    state.followupHistory = [];

    var coinQuestion = $('coinQuestion');
    if (coinQuestion) coinQuestion.textContent = q;

    ['coin1', 'coin2', 'coin3'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.className = 'coin';
      var c = el.querySelector('.coin__char');
      if (c) c.textContent = '?';
    });

    var throwBtn = $('throwBtn');
    if (throwBtn) {
      throwBtn.disabled = false;
      throwBtn.textContent = '摇一摇';
    }

    var resultText = $('throwResultText');
    if (resultText) resultText.textContent = '';

    var startBtn = $('startBtn');
    if (startBtn) {
      startBtn.classList.remove('is-loading');
      startBtn.disabled = true;
      startBtn.textContent = '已开始';
    }

    renderProgress();
    updateThrowMeta();
    switchStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateThrowMeta() {
    var count = $('coinCount');
    var yao = $('coinYao');
    if (count) count.textContent = state.currentThrow >= 6 ? '六爻已满' : '第 ' + (state.currentThrow + 1) + '/6 次';
    if (yao) yao.textContent = state.currentThrow >= 6 ? '' : YAO_NAMES[state.currentThrow];
  }

  /* ===== 摇卦 ===== */
  function classifyCoins(coins) {
    var sum = coins[0] + coins[1] + coins[2];
    if (sum === 3) return { sum: sum, type: '老阳', symbol: '—○', emoji: '⚊○', label: '三背 · 老阳（变爻）' };
    if (sum === 2) return { sum: sum, type: '少阳', symbol: '—', emoji: '⚊', label: '两背一字 · 少阳' };
    if (sum === 1) return { sum: sum, type: '少阴', symbol: '- -', emoji: '⚋', label: '两字一背 · 少阴' };
    return { sum: sum, type: '老阴', symbol: '- -☓', emoji: '⚋☓', label: '三字 · 老阴（变爻）' };
  }

  function renderProgress() {
    var container = $('throwProgress');
    if (!container) return;
    container.innerHTML = '';

    for (var i = 0; i < 6; i++) {
      var result = state.coins[i] ? classifyCoins(state.coins[i]) : null;
      var slip = document.createElement('div');
      slip.className = 'slip';
      if (result) slip.classList.add('is-filled');
      if (i === state.currentThrow && state.currentThrow < 6) slip.classList.add('is-current');

      var label = document.createElement('span');
      label.className = 'slip__label';
      label.textContent = YAO_NAMES[i];

      var symbol = document.createElement('span');
      symbol.className = 'slip__symbol';
      symbol.textContent = result ? result.emoji : '·';

      slip.appendChild(label);
      slip.appendChild(symbol);
      container.appendChild(slip);
    }
  }

  function throwCoins() {
    if (state.isThrowing) return;
    if (state.currentThrow >= 6) {
      finishThrows();
      return;
    }

    state.isThrowing = true;
    var btn = $('throwBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '摇卦中…';
    }

    var coinEls = [$('coin1'), $('coin2'), $('coin3')];
    coinEls.forEach(function (el) {
      if (!el) return;
      el.classList.remove('is-front', 'is-back');
      el.classList.add('is-flipping');
    });

    // 随机生成结果（增强熵源：混合 Math.random + 时间戳 + 性能计数器）
    var now = Date.now();
    var perf = (typeof performance !== 'undefined' && performance.now) ? performance.now() : now;
    var seed = (Math.random() + (now % 997) / 997 + (perf % 1)) % 1;
    var vals = [
      seed < 0.5 ? 1 : 0,
      ((seed * 9301 + 49297) % 1) < 0.5 ? 1 : 0,
      ((seed * 49297 + 9301) % 1) < 0.5 ? 1 : 0
    ];

    window.setTimeout(function () {
      var result = classifyCoins(vals);

      coinEls.forEach(function (el, i) {
        if (!el) return;
        el.classList.remove('is-flipping');
        el.classList.add(vals[i] === 1 ? 'is-back' : 'is-front');
        var c = el.querySelector('.coin__char');
        if (c) c.textContent = vals[i] === 1 ? '背' : '字';
      });

      state.coins.push(vals);
      var throwNo = state.currentThrow + 1;
      state.currentThrow++;
      renderProgress();
      updateThrowMeta();

      var resultText = $('throwResultText');
      if (resultText) resultText.textContent = '第 ' + throwNo + ' 次：' + result.label;

      state.isThrowing = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = state.currentThrow >= 6 ? '确认卦象，开始排盘' : '摇第 ' + (state.currentThrow + 1) + '/6 次';
      }
    }, 760);
  }

  function finishThrows() {
    if (state.coins.length !== 6) return;
    var btn = $('throwBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '正在排盘…';
    }
    callDivine();
  }

  /* ===== 排盘 ===== */
  async function callDivine() {
    var requestId = ++state.requestId;
    switchStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    var loading = $('loadingDivine');
    var reading = $('readingCards');
    var baguaBox = $('baguaContainer');
    var dongBox = $('dongYaoInfo');
    var followup = $('followupArea');
    var name = $('resultGuaName');
    var meta = $('resultGuaMeta');

    if (loading) loading.classList.add('is-visible');
    if (reading) reading.innerHTML = '';
    if (baguaBox) baguaBox.innerHTML = '';
    if (dongBox) dongBox.innerHTML = '';
    if (followup) followup.style.display = 'none';
    if (name) name.textContent = '—';
    if (meta) meta.textContent = '';

    try {
      var res = await fetch('/api/divine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: state.question, coins: state.coins })
      });

      if (!res.ok) {
        var message = 'HTTP ' + res.status;
        try {
          var errData = await res.json();
          if (errData && errData.error) message = errData.error;
        } catch (err2) {}
        throw new Error(message);
      }

      var data = await res.json();
      if (requestId !== state.requestId) return;

      state.bagua = data.bagua;
      if (loading) loading.classList.remove('is-visible');
      if (data.bagua) renderBagua(data.bagua);
      renderReading(data.aiReading, data.reading);
      if (followup) followup.style.display = '';
      state.isDivining = false;
    } catch (err) {
      if (requestId !== state.requestId) return;
      if (loading) loading.classList.remove('is-visible');
      if (reading) {
        reading.innerHTML = '<article class="card card--bamboo card--reading"><span class="seal" aria-hidden="true">误</span><h2>排盘出错</h2><div class="reading-body"><p>' + escapeHtml(err.message) + '</p><p>请检查服务是否正常，或重新起卦。</p></div></article>';
      }
      state.isDivining = false;
    }
  }

  function renderBagua(bagua) {
    if (!bagua || !bagua.benGua) return;

    var bg = bagua.benGua;
    var vg = bagua.bianGua;

    var name = $('resultGuaName');
    if (name) name.textContent = '本卦 · ' + bg.name;

    var meta = $('resultGuaMeta');
    if (meta) {
      meta.textContent = (bg.symbol || '') + ' · ' + (bg.palace || '') + '宫（' + (bg.element || '') + '）';
    }

    var box = $('baguaContainer');
    if (box) {
      box.innerHTML = renderGuaciCard(bg, vg) + renderHexCard(bg, '本卦') + (vg ? renderHexCard(vg, '变卦') : '');
    }

    var dong = $('dongYaoInfo');
    if (dong) {
      if (bagua.dongYao && bagua.dongYao.length) {
        var names = bagua.dongYao.map(function (n) {
          return YAO_NAMES[n - 1] || n + '爻';
        }).join('、');
        dong.innerHTML = '<div class="dong-info">动爻：<strong>' + escapeHtml(names) + '</strong> — 事物变化的关键</div>';
      } else {
        dong.innerHTML = '<div class="dong-info">静卦 — 无动爻，事态相对稳定</div>';
      }
    }
  }

  /* 卦辞卡：原文照录，不做解释 */
  function renderGuaciCard(bg, vg) {
    if (!bg) return '';

    function block(gua, label) {
      if (!gua) return '';
      var head = '<div class="guaci-block__head">' +
        '<span class="guaci-block__label">' + escapeHtml(label) + '</span>' +
        '<span class="guaci-block__name">' + escapeHtml(gua.name || '') + '</span>' +
        '<span class="guaci-block__symbol">' + escapeHtml(gua.symbol || '') + '</span>' +
      '</div>';

      var body = '';
      if (gua.judgment) {
        body += '<p class="guaci-block__text"><span class="guaci-block__tag">卦辞</span>' + escapeHtml(gua.judgment) + '</p>';
      }
      if (gua.greatImage) {
        body += '<p class="guaci-block__text"><span class="guaci-block__tag">大象</span>' + escapeHtml(gua.greatImage) + '</p>';
      }
      if (!body) return '';

      return '<div class="guaci-block">' + head + body + '</div>';
    }

    var inner = block(bg, '本卦') + block(vg, '变卦');
    if (!inner) return '';

    return '<article class="card card--bamboo guaci-card">' +
      '<span class="seal" aria-hidden="true">辞</span>' +
      inner +
    '</article>';
  }

  function renderHexCard(gua, label) {
    var lines = (gua.lines || []).slice().sort(function (a, b) {
      return Number(b.position) - Number(a.position);
    });

    var rows = lines.map(function (l) {
      var pos = Number(l.position) || 0;
      var yao = l.yao || (pos % 2 === 0 ? '⚊' : '⚋');
      var marker = l.isChanging ? (l.type === '老阳' ? '○' : '☓') : '';
      var shiying = l.shiying
        ? '<span class="badge badge--' + (l.shiying === '世' ? 'shi' : 'ying') + '">' + escapeHtml(l.shiying) + '</span>'
        : '—';
      var ganZhi = escapeHtml((l.gan || '') + (l.zhi || '')) || '—';

      return '<div class="hex-line' + (l.isChanging ? ' is-changing' : '') + '">' +
        '<span class="hex-line__pos">' + (YAO_NAMES[pos - 1] || pos + '爻') + '</span>' +
        '<span class="hex-line__yao">' + escapeHtml(yao) + (marker ? '<sup>' + marker + '</sup>' : '') + '</span>' +
        '<span class="hex-line__detail">' +
          '<span data-label="干支">' + ganZhi + '</span>' +
          '<span data-label="五行">' + escapeHtml(l.element || '—') + '</span>' +
          '<span data-label="六亲">' + escapeHtml(l.liuqin || '—') + '</span>' +
          '<span data-label="六神">' + escapeHtml(l.liushen || '—') + '</span>' +
          '<span data-label="世应">' + shiying + '</span>' +
        '</span>' +
      '</div>';
    }).join('');

    return '<article class="card card--bamboo hex-card">' +
      '<div class="hex-card__head">' +
        '<div class="hex-card__title">' + escapeHtml(label) + ' · ' + escapeHtml(gua.name || '') + '</div>' +
        '<div class="hex-card__meta">' + escapeHtml(gua.symbol || '') + '<br>' + escapeHtml(gua.palace || '') + '宫 · ' + escapeHtml(gua.element || '') + '</div>' +
      '</div>' +
      '<div class="hex-lines">' + rows + '</div>' +
    '</article>';
  }

  /* ===== 解读 ===== */
  function renderReading(aiReading, fallbackText) {
    var box = $('readingCards');
    if (!box) return;

    var text = String(aiReading || '').trim();
    if (!text) {
      box.innerHTML = '<article class="card card--bamboo card--reading"><span class="seal" aria-hidden="true">卦</span><h2>解卦</h2><div class="reading-body"><p>AI 解读暂不可用。以上排盘可供参考，请稍后重试。</p></div></article>';
      return;
    }

    // 兜底：模型偶尔把标题写成裸行「卦象详解」，补回标记，避免整段被吞进上一节
    var normalized = text.replace(/^\s*(?:#{1,3}\s*)?卦象详解\s*$/gm, '【卦象详解】');

    // 卦辞原文由右侧卦辞卡承载；建议、免责不再出现在结果页（旧缓存/偶发输出同样过滤）
    var HIDDEN = { guaci: 1, advice: 1, disclaimer: 1 };
    var sections = parseSections(normalized).filter(function (sec) { return !HIDDEN[sec.kind]; });
    var sealMap = { summary: '判', guaci: '辞', analysis: '详', advice: '议', disclaimer: '免', general: '卦' };

    box.innerHTML = sections.map(function (sec) {
      return '<article class="card card--bamboo card--reading' + (sec.kind === 'disclaimer' ? ' is-note' : '') + '">' +
        '<span class="seal" aria-hidden="true">' + (sealMap[sec.kind] || '卦') + '</span>' +
        '<h2>' + escapeHtml(sec.title) + '</h2>' +
        '<div class="reading-body">' + renderMarkdown(sec.body) + '</div>' +
      '</article>';
    }).join('');
  }

  function parseSections(text) {
    var clean = String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/^##\s*(总体判断|卦辞原文|卦象详解|建议|免责)\s*$/gm, '【$1】')
      .replace(/\*\*(总体判断|卦辞原文|卦象详解|建议|免责)\*\*/g, '【$1】')
      .trim();

    var defs = {
      '总体判断': { title: '总体判断', kind: 'summary' },
      '卦辞原文': { title: '卦辞原文', kind: 'guaci' },
      '卦象详解': { title: '卦象详解', kind: 'analysis' },
      '建议': { title: '建议', kind: 'advice' },
      '免责': { title: '免责', kind: 'disclaimer' }
    };

    var re = /【(总体判断|卦辞原文|卦象详解|建议|免责)】/g;
    var matches = [];
    var m;
    while ((m = re.exec(clean)) !== null) {
      matches.push({ title: m[1], index: m.index, length: m[0].length });
    }

    if (!matches.length) {
      return [{ title: '解卦', kind: 'general', body: clean.replace(/^[-—\s]+/, '').trim() }];
    }

    var sections = [];
    matches.forEach(function (match, i) {
      var start = match.index + match.length;
      var end = i + 1 < matches.length ? matches[i + 1].index : clean.length;
      var body = clean.slice(start, end).trim();
      body = body.replace(/^[-—\s]+/, '').replace(/[-—\s]+$/, '').trim();
      if (!body) return;
      var def = defs[match.title] || { title: match.title, kind: 'general' };
      sections.push({ title: def.title, kind: def.kind, body: body });
    });

    return sections.length ? sections : [{ title: '解卦', kind: 'general', body: clean }];
  }

  function renderMarkdown(text) {
    if (!text) return '';

    var safe = escapeHtml(text);
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

    var lines = safe.split('\n');
    var html = '';
    var list = null;

    function closeList() {
      if (list) {
        html += '</' + list + '>';
        list = null;
      }
    }

    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) {
        closeList();
        html += '<br>';
        return;
      }
      if (/^-{3,}$/.test(line)) {
        closeList();
        html += '<hr>';
        return;
      }

      var mm = line.match(/^[-•]\s+(.+)$/);
      if (mm) {
        if (list !== 'ul') {
          closeList();
          html += '<ul>';
          list = 'ul';
        }
        html += '<li>' + mm[1] + '</li>';
        return;
      }

      mm = line.match(/^\d+[.、]\s*(.+)$/);
      if (mm) {
        if (list !== 'ol') {
          closeList();
          html += '<ol>';
          list = 'ol';
        }
        html += '<li>' + mm[1] + '</li>';
        return;
      }

      closeList();
      html += '<p>' + line + '</p>';
    });

    closeList();
    return html;
  }

  /* ===== 追问 ===== */
  async function askFollowup() {
    var input = $('followupInput');
    var btn = $('followupBtn');
    if (!input || !btn || !state.bagua) return;

    var text = input.value.trim();
    if (!text || btn.disabled) return;

    var followupId = ++state.followupId;
    btn.disabled = true;
    btn.textContent = '推演中…';
    input.disabled = true;

    state.followupHistory.push({ role: 'user', content: text });
    var pending = { role: 'assistant', content: '正在推演…', pending: true };
    state.followupHistory.push(pending);
    renderFollowupHistory();
    input.value = '';

    var historyForApi = state.followupHistory
      .filter(function (item) { return !item.pending; })
      .slice(0, -1)
      .map(function (item) {
        return { role: item.role === 'user' ? 'user' : 'assistant', content: item.content };
      });

    try {
      var res = await fetch('/api/divine/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bagua: state.bagua, history: historyForApi, followup: text })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var data = await res.json();
      if (followupId !== state.followupId) return;

      var reply = String(data.reply || '').trim() || '（没有收到回复）';
      replacePending(pending, { role: 'assistant', content: reply });
    } catch (err) {
      if (followupId !== state.followupId) return;
      replacePending(pending, { role: 'assistant', content: '追问出错：' + err.message });
    } finally {
      if (followupId === state.followupId) {
        renderFollowupHistory();
        btn.disabled = false;
        btn.textContent = '追问';
        input.disabled = false;
      }
    }
  }

  function replacePending(pending, replacement) {
    var index = state.followupHistory.indexOf(pending);
    if (index >= 0) {
      state.followupHistory[index] = replacement;
    } else {
      state.followupHistory.push(replacement);
    }
  }

  function renderFollowupHistory() {
    var box = $('followupHistory');
    if (!box) return;

    box.innerHTML = state.followupHistory.map(function (item) {
      var isQ = item.role === 'user';
      var content = isQ
        ? escapeHtml(item.content).replace(/\n/g, '<br>')
        : renderMarkdown(item.content);
      return '<div class="followup-item ' + (isQ ? 'q' : 'a') + (item.pending ? ' is-pending' : '') + '">' +
        '<div class="role">' + (isQ ? '你' : '卦师') + '</div>' +
        '<div class="content">' + content + '</div>' +
      '</div>';
    }).join('');

    box.scrollTop = box.scrollHeight;
  }

  /* ===== 重新起卦 ===== */
  function restart() {
    state.requestId++;
    state.refineId++;
    state.followupId++;
    state.question = '';
    state.coins = [];
    state.currentThrow = 0;
    state.isThrowing = false;
    state.isDivining = false;
    state.isRefining = false;
    state.bagua = null;
    state.followupHistory = [];

    var input = $('questionInput');
    if (input) input.value = '';

    var startBtn = $('startBtn');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.classList.remove('is-loading');
      startBtn.textContent = '静心起卦 →';
    }

    var throwBtn = $('throwBtn');
    if (throwBtn) {
      throwBtn.disabled = false;
      throwBtn.textContent = '摇一摇';
    }

    var resultText = $('throwResultText');
    if (resultText) resultText.textContent = '';

    var coinQuestion = $('coinQuestion');
    if (coinQuestion) coinQuestion.textContent = '';

    var coinCount = $('coinCount');
    if (coinCount) coinCount.textContent = '第 1/6 次';

    var coinYao = $('coinYao');
    if (coinYao) coinYao.textContent = '初爻';

    ['coin1', 'coin2', 'coin3'].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.className = 'coin';
      var c = el.querySelector('.coin__char');
      if (c) c.textContent = '?';
    });

    renderProgress();

    var baguaBox = $('baguaContainer');
    if (baguaBox) baguaBox.innerHTML = '';

    var dongBox = $('dongYaoInfo');
    if (dongBox) dongBox.innerHTML = '';

    var reading = $('readingCards');
    if (reading) reading.innerHTML = '';

    var followup = $('followupArea');
    if (followup) followup.style.display = 'none';

    var followupHistory = $('followupHistory');
    if (followupHistory) followupHistory.innerHTML = '';

    var followupInput = $('followupInput');
    if (followupInput) {
      followupInput.value = '';
      followupInput.disabled = false;
    }

    var followupBtn = $('followupBtn');
    if (followupBtn) {
      followupBtn.disabled = false;
      followupBtn.textContent = '追问';
    }

    var name = $('resultGuaName');
    if (name) name.textContent = '—';

    var meta = $('resultGuaMeta');
    if (meta) meta.textContent = '';

    var loading = $('loadingDivine');
    if (loading) loading.classList.remove('is-visible');

    hideRefine();
    clearFormError();
    switchStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (input) input.focus();
  }

  /* ===== 事件绑定 ===== */
  function bindEvents() {
    var startBtn = $('startBtn');
    if (startBtn) startBtn.addEventListener('click', startDivine);

    var questionInput = $('questionInput');
    if (questionInput) {
      questionInput.addEventListener('input', function () {
        clearFormError();
        var box = $('refineBox');
        if (box && box.classList.contains('is-visible')) hideRefine();
      });
      questionInput.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          startDivine();
        }
      });
    }

    var topics = $('topicChips');
    if (topics) {
      topics.addEventListener('click', function (event) {
        var btn = event.target.closest ? event.target.closest('[data-topic]') : null;
        if (btn) setTopic(btn.getAttribute('data-topic'), btn);
      });
    }

    var examples = $('examplesRow');
    if (examples) {
      examples.addEventListener('click', function (event) {
        var btn = event.target.closest ? event.target.closest('[data-example]') : null;
        if (btn) setExample(Number(btn.getAttribute('data-example')));
      });
    }

    var guideBtn = $('guideBtn');
    if (guideBtn) {
      guideBtn.addEventListener('click', function () {
        var guide = $('guide');
        if (guide) guide.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    var throwBtn = $('throwBtn');
    if (throwBtn) throwBtn.addEventListener('click', throwCoins);

    var followupBtn = $('followupBtn');
    if (followupBtn) followupBtn.addEventListener('click', askFollowup);

    var followupInput = $('followupInput');
    if (followupInput) {
      followupInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          askFollowup();
        }
      });
    }

    var restartBtn = $('restartBtn');
    if (restartBtn) restartBtn.addEventListener('click', restart);

    var useRefinedBtn = $('useRefinedBtn');
    if (useRefinedBtn) useRefinedBtn.addEventListener('click', useRefined);

    var dismissRefineBtn = $('dismissRefineBtn');
    if (dismissRefineBtn) dismissRefineBtn.addEventListener('click', dismissRefine);
  }

  /* ===== 初始化 ===== */
  function init() {
    bindEvents();
    populateExamples();
    renderProgress();
    switchStep(0);

    document.querySelectorAll('#step0 .card').forEach(function (el, index) {
      el.style.setProperty('--i', String(index));
    });

    initSplash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
