/**
 * 观象 · 六爻问事 - 后端服务
 * 混合式对话：固定起卦 + AI 解读 + 追问
 *
 * 环境变量：
 *   PORT       - 端口（默认 3999）
 *   AI_API_KEY  - AI API Key
 *   AI_BASE_URL - AI API 地址（默认 https://api.deepseek.com）
 *   AI_MODEL    - 模型名（默认 deepseek-v4-flash）
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createDivination } = require('../engine/index');
const { getDayGanZhi } = require('../engine/day_gan_zhi');
const { getDivineReading, getFollowupReading, buildDivinationText, refineQuestion } = require('./ai_service');

const app = express();
const PORT = process.env.PORT || 3999;

// ===== 极简访问日志 =====
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}
function getLogFile() {
  return path.join(LOG_DIR, 'access-' + new Date().toISOString().slice(0, 10) + '.log');
}
function writeAccessLog(ip, method, url, summary) {
  var line = '[' + new Date().toISOString() + '] ' + ip + ' ' + method + ' ' + url + ' | ' + (summary || '') + '\n';
  fs.appendFile(getLogFile(), line, function() {});
}

// ===== 并发请求保护 =====
const MAX_CONCURRENT_AI_REQUESTS = 5;
let activeAIRequests = 0;

function withConcurrencyLimit(handler) {
  return async function(req, res) {
    if (activeAIRequests >= MAX_CONCURRENT_AI_REQUESTS) {
      return res.status(503).json({ error: '服务器繁忙，请稍后再试' });
    }
    activeAIRequests++;
    try {
      await handler(req, res);
    } finally {
      activeAIRequests--;
    }
  };
}

// ===== Express 30 秒请求超时中间件 =====
function requestTimeout(req, res, next) {
  req.setTimeout(30000, function() {
    console.error('[Timeout] 请求处理超过 30 秒:', req.originalUrl);
    if (!res.headersSent) {
      res.status(504).json({ error: '请求处理超时，请稍后再试' });
    }
  });
  next();
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(requestTimeout);
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: 0,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// ===== 健康检查 =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: !!process.env.AI_API_KEY,
    dayGanZhi: getDayGanZhi().ganZhi,
    timestamp: new Date().toISOString()
  });
});

// ===== 初始起卦 + AI 解读 =====
app.post('/api/divine', withConcurrencyLimit(async (req, res) => {
  try {
    const { question, coins } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: '问题不能为空' });
    }
    if (!coins || !Array.isArray(coins) || coins.length !== 6) {
      return res.status(400).json({ error: '需要6次摇卦结果' });
    }

    // 记录访问日志（问题前20字）
    writeAccessLog(req.ip || req.connection.remoteAddress, 'POST', '/api/divine', question.trim().substring(0, 20));

    // 获取当天日干支
    const { ganZhi } = getDayGanZhi();

    // 排盘
    const bagua = createDivination(coins, ganZhi);

    // 构建排盘文本（用于 API 响应）
    const readingText = buildDivinationText(bagua, question);

    // AI 解读
    const aiReading = await getDivineReading(bagua, question);

    res.json({
      bagua,
      reading: readingText,
      aiReading,
      dayGanZhi: ganZhi
    });

  } catch (err) {
    console.error('Divine error:', err);
    res.status(500).json({ error: '服务内部错误，请稍后重试' });
  }
}));

// ===== 追问 =====
app.post('/api/divine/followup', withConcurrencyLimit(async (req, res) => {
  try {
    const { bagua, history, followup } = req.body;

    if (!followup || !followup.trim()) {
      return res.status(400).json({ error: '追问内容不能为空' });
    }
    if (!bagua) {
      return res.status(400).json({ error: '需要上一次的卦象数据' });
    }

    // 记录访问日志（追问前20字）
    writeAccessLog(req.ip || req.connection.remoteAddress, 'POST', '/api/divine/followup', followup.trim().substring(0, 20));

    const followupCount = history ? Math.floor(history.length / 2) : 0;
    const reply = await getFollowupReading(bagua, history || [], followup, followupCount);

    res.json({ reply });

  } catch (err) {
    console.error('Followup error:', err);
    res.status(500).json({ error: '服务内部错误，请稍后重试' });
  }
}));

// ===== 补全问题 =====
app.post('/api/refine-question', withConcurrencyLimit(async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: '问题不能为空' });
    }

    const refined = await refineQuestion(question);

    res.json({ original: question, refined });

  } catch (err) {
    console.error('Refine error:', err);
    res.status(500).json({ error: '服务内部错误，请稍后重试' });
  }
}));

const server = app.listen(PORT, () => {
  const { ganZhi } = getDayGanZhi();
  const aiOK = !!process.env.AI_API_KEY;
  console.log(`🐾 观象 · 六爻问事服务启动`);
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   今日日干支: ${ganZhi}`);
  console.log(`   AI: ${aiOK ? '已接入 ✅' : '未配置 API Key（读取本地排盘） ❌'}`);
  console.log(`   端点: POST /api/divine`);
  console.log(`         POST /api/divine/followup`);
  console.log(`         GET  /api/health`);
});

// 服务器层面也设置 30 秒超时（兜底）
server.timeout = 30000;
