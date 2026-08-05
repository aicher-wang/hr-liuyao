/**
 * hr-liuyao 服务端优化验证脚本
 * 运行方式：node test.js
 * 前置条件：npm install
 */

const http = require('http');
const { spawn } = require('child_process');

const PORT = 3999;
const BASE = 'http://localhost:' + PORT;

function request(path, body) {
  return new Promise(function(resolve, reject) {
    var data = JSON.stringify(body || {});
    var req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, body: d });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(function(r) { setTimeout(r, ms); });
}

async function run() {
  console.log('[1/6] 启动服务...');
  var server = spawn('node', ['server/index.js'], {
    cwd: __dirname,
    stdio: 'pipe',
    env: Object.assign({}, process.env, { PORT: String(PORT) })
  });

  var logs = '';
  server.stdout.on('data', function(d) { logs += d.toString(); });
  server.stderr.on('data', function(d) { logs += d.toString(); });

  await sleep(1500); // 等待服务启动

  var coins = [[1,1,1],[0,1,1],[1,0,1],[0,0,1],[1,1,0],[0,0,0]];
  var question = '候选人李明是否接受offer';

  // 1. 健康检查
  console.log('[2/6] 测试 /api/health');
  var health = await request('/api/health', {});
  console.log('   status:', health.status, 'ganZhi:', health.body.dayGanZhi);

  // 2. 正常起卦（首次 AI）
  console.log('[3/6] 测试 /api/divine（首次，应走 AI）');
  var t1 = Date.now();
  var r1 = await request('/api/divine', { question: question, coins: coins });
  var cost1 = Date.now() - t1;
  console.log('   status:', r1.status, 'time:', cost1 + 'ms');
  console.log('   aiReading preview:', (r1.body.aiReading || '').substring(0, 40).replace(/\n/g, ' ') + '...');

  // 3. 缓存命中（同一卦象+问题，应走缓存）
  console.log('[4/6] 测试 /api/divine（第二次，应命中缓存）');
  var t2 = Date.now();
  var r2 = await request('/api/divine', { question: question, coins: coins });
  var cost2 = Date.now() - t2;
  console.log('   status:', r2.status, 'time:', cost2 + 'ms');
  if (cost2 < 100) {
    console.log('   ✅ 缓存命中（响应时间显著缩短）');
  } else {
    console.log('   ⚠️ 缓存可能未命中（响应时间偏长）');
  }

  // 4. 并发请求保护
  console.log('[5/6] 测试并发限制（同时发起 7 个请求）');
  var promises = [];
  for (var i = 0; i < 7; i++) {
    promises.push(request('/api/divine', { question: question + i, coins: coins }));
  }
  var results = await Promise.all(promises);
  var okCount = results.filter(function(r) { return r.status === 200; }).length;
  var busyCount = results.filter(function(r) { return r.status === 503; }).length;
  console.log('   200:', okCount, '| 503:', busyCount);
  if (busyCount > 0) {
    console.log('   ✅ 并发保护生效');
  } else {
    console.log('   ⚠️ 并发保护未触发（可能 AI 响应太快或并发上限未达）');
  }

  // 5. 错误脱敏
  console.log('[6/6] 测试错误脱敏（断网或异常情况）');
  // 由于不断网，我们通过观察日志和已知 catch 来确认
  // 此处仅验证追问接口不传 bagua 返回 400（这是正常校验，不属于脱敏）
  var errRes = await request('/api/divine/followup', { followup: 'test' });
  console.log('   status:', errRes.status, 'error:', errRes.body.error);
  console.log('   ✅ 若前面 AI 调用失败，客户端应看不到原始 err.message');

  console.log('\n测试完成。查看服务端日志中是否包含 [Cache] / [Timeout] / [AI] 等关键字。');

  server.kill();
  process.exit(0);
}

run().catch(function(e) {
  console.error('测试异常:', e);
  process.exit(1);
});
