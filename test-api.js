import fetch from 'node-fetch';

// 测试API脚本
async function testAPI() {
  const baseURL = 'http://localhost:3000'; // 本地测试URL
  
  console.log('🧪 开始测试AI思维导图生成API...\n');

  try {
    // 测试思维导图生成
    console.log('1. 测试思维导图生成...');
    const response = await fetch(`${baseURL}/api/generate-mindmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: '人工智能'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API调用成功!');
      console.log('响应数据:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ API调用失败:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('错误详情:', errorText);
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    console.log('请确保服务器正在运行 (npm run dev)');
  }
}

// 运行测试
testAPI().catch(console.error);