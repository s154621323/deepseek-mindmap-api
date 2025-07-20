// 设置环境变量并启动服务器
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

// 设置默认值
const PORT = process.env.PORT || '3000';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

if (!DEEPSEEK_API_KEY) {
  console.error('错误: 未设置DEEPSEEK_API_KEY环境变量，请在.env文件中配置');
  process.exit(1);
}

console.log('启动思维导图AI服务器...');
console.log('环境变量设置:');
console.log('- PORT:', PORT);
console.log('- DEEPSEEK_API_KEY:', '******' + DEEPSEEK_API_KEY.slice(-6));

// 启动服务器
import('./index.js').catch(err => {
  console.error('启动服务器时出错:', err);
  process.exit(1);
});
