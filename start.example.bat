@echo off
REM 六爻 HR 智能卦师 - 启动脚本（模板，不含真实 API Key）
REM 复制为 start.bat 并填入你的 DeepSeek API Key 后使用
cd /d %~dp0
set AI_API_KEY=你的_DeepSeek_API_Key
set AI_BASE_URL=https://api.deepseek.com
set AI_MODEL=deepseek-v4-flash
node server\index.js
pause
