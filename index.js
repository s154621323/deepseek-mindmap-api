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

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log('使用DeepSeek AI接口生成思维导图');
  console.log('DeepSeek API密钥已配置');
}); 