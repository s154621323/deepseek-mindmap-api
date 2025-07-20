// Cloudflare Worker版本
// 注意：这个版本移除了文件系统操作，因为Cloudflare Worker不支持

export default {
  async fetch(request, env, ctx) {
    // 处理CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 只处理POST请求
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: '只支持POST请求' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const url = new URL(request.url);
      
      // 处理思维导图生成请求
      if (url.pathname === '/api/generate-mindmap') {
        const body = await request.json();
        const { topic } = body;

        if (!topic) {
          return new Response(JSON.stringify({ error: '缺少主题参数' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        // 生成思维导图内容
        const result = await generateMindMap(topic, env);
        
        return new Response(JSON.stringify({
          success: true,
          data: result.content,
          topic: result.topic,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify({ error: '未找到路由' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Worker错误:', error);
      return new Response(JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};

/**
 * 生成思维导图（Cloudflare Worker版本）
 * @param {string} topic 主题
 * @param {Object} env 环境变量
 * @returns {Promise<Object>} 返回生成结果
 */
async function generateMindMap(topic, env) {
  try {
    console.log('开始生成思维导图，主题:', topic);

    const prompt = `
为主题"${topic}"创建一个详细的思维导图结构。
请生成5-7个主要方面或类别，每个都应该与主题密切相关。
必须返回Markdown格式，使用以下结构:
#主题1,
##子主题1,
##子主题2,
#主题2,
##子主题1,
##子主题2,
...
只返回Markdown数据，不要有任何其他文本。`;

    // 调用DeepSeek API
    const response = await callDeepSeekAPI(prompt, env.DEEPSEEK_API_KEY);
    
    return {
      content: response.text,
      topic: topic
    };

  } catch (error) {
    console.error('生成思维导图内容时出错:', error);
    throw error;
  }
}

/**
 * 调用DeepSeek API
 * @param {string} prompt 提示词
 * @param {string} apiKey API密钥
 * @returns {Promise<Object>} API响应
 */
async function callDeepSeekAPI(prompt, apiKey) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API调用失败: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content
  };
}