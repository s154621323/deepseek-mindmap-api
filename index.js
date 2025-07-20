import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mindMapAgent } from './agents/mindMapAgent.js';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 使用DeepSeek增强智能体
const agent = mindMapAgent;

// 路由
app.post('/api/generate-mindmap', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: '缺少主题参数' });
    }

    // 生成思维导图内容
    const response = await agent.generateMindMap(topic);

    // 直接返回生成的结果
    res.json({
      success: true,
      data: response,
      topic: topic
    });

  } catch (error) {
    console.error('API调用出错:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
});

// 添加业务生成端点
app.post('/api/generate-business', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: '缺少查询参数' });
    }

    // 调用外部API
    const externalResponse = await fetch('https://mastra-ai-demo.ricardo-pangj.workers.dev/api/agents/businessAgent/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: query
          }
        ],
        maxSteps: 3
      })
    });

    if (!externalResponse.ok) {
      throw new Error(`外部API调用失败: ${externalResponse.status}`);
    }
    console.log(externalResponse)
    const externalData = await externalResponse.json();

    res.json({
      success: true,
      data: {
        type: "text",
        result: externalData.response?.body?.choices?.[0]?.message?.content || externalData.text
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('调用外部API时出错:', error);
    res.status(500).json({
      success: false,
      error: '外部API调用失败',
      message: error.message
    });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log('使用DeepSeek AI接口生成思维导图');
  console.log('DeepSeek API密钥已配置');
});