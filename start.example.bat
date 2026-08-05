@echo off
REM 六爻 HR 智能卦师 - 启动脚本（模板，不含真实 API Key）
REM 复制为 start.bat 并填入你的 DeepSeek API Key 后使用
REM
REM 模型切换说明：
REM   deepseek-v4-flash  - 原默认，速度快（若长prompt异常可换）
REM   deepseek-chat      - DeepSeek-V3，解读完整，当前推荐
REM   deepseek-reasoner  - 推理型，质量高但更慢、更贵
REM
REM 只需修改 AI_MODEL 即可切换，无需改代码
cd /d %~dp0
set AI_API_KEY=你的_DeepSeek_API_Key
set AI_BASE_URL=https://api.deepseek.com
set AI_MODEL=deepseek-chat
set PORT=3999
node server\index.js
pause
