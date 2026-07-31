/**
 * 六爻 HR 智能卦师 - 后端服务
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
const { createDivination } = require('../engine/index');
const { getDayGanZhi } = require('../engine/day_gan_zhi');
const { getDivineReading, getFollowupReading, buildDivinationText, refineQuestion } = require('./ai_service');

const app = express();
const PORT = process.env.PORT || 3999;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
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
app.post('/api/divine', async (req, res) => {
  try {
    const { question, coins } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: '问题不能为空' });
    }
    if (!coins || !Array.isArray(coins) || coins.length !== 6) {
      return res.status(400).json({ error: '需要6次摇卦结果' });
    }

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
    res.status(500).json({ error: err.message });
  }
});

// ===== 追问 =====
app.post('/api/divine/followup', async (req, res) => {
  try {
    const { bagua, history, followup } = req.body;

    if (!followup || !followup.trim()) {
      return res.status(400).json({ error: '追问内容不能为空' });
    }
    if (!bagua) {
      return res.status(400).json({ error: '需要上一次的卦象数据' });
    }

    const reply = await getFollowupReading(bagua, history || [], followup);

    res.json({ reply });

  } catch (err) {
    console.error('Followup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== 补全问题 =====
app.post('/api/refine-question', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: '问题不能为空' });
    }

    const refined = await refineQuestion(question);

    res.json({ original: question, refined });

  } catch (err) {
    console.error('Refine error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  const { ganZhi } = getDayGanZhi();
  const aiOK = !!process.env.AI_API_KEY;
  console.log(`🐾 六爻 HR 智能卦师服务启动`);
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   今日日干支: ${ganZhi}`);
  console.log(`   AI: ${aiOK ? '已接入 ✅' : '未配置 API Key（读取本地排盘） ❌'}`);
  console.log(`   端点: POST /api/divine`);
  console.log(`         POST /api/divine/followup`);
  console.log(`         GET  /api/health`);
});
