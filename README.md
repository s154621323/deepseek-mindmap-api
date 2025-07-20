# AI 思维导图生成器

一个基于DeepSeek AI的思维导图生成服务，支持自动生成结构化思维导图内容。

## 功能特性

- 🤖 使用DeepSeek AI生成高质量思维导图内容
- 📊 自动生成5-7个主要方面，每个方面包含3-5个子主题
- 💾 支持本地文件保存和AWS S3云端存储
- 🌐 提供RESTful API接口
- 📝 输出Markdown格式，便于后续处理

## 技术栈

- **后端**: Node.js + Express
- **AI服务**: DeepSeek API
- **存储**: AWS S3
- **部署**: Cloudflare Worker (支持)

## 快速开始

### 环境要求

- Node.js 18+
- AWS S3 存储桶
- DeepSeek API 密钥

### 安装依赖

```bash
npm install
```

### 环境变量配置

创建 `.env` 文件：

```env
# DeepSeek API配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# AWS S3配置
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# 服务器配置
PORT=3000
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 使用

### 生成思维导图

**POST** `/api/generate-mindmap`

**请求体:**
```json
{
  "topic": "人工智能"
}
```

**响应:**
```json
{
  "success": true,
  "data": "生成的思维导图内容",
  "topic": "人工智能"
}
```

## 项目结构

```
├── agents/
│   └── mindMapAgent.js    # 思维导图生成智能体
├── outputs/               # 生成的文件输出目录
├── index.js              # Express服务器
├── package.json          # 项目配置
└── README.md            # 项目说明
```

## 开发说明

### 思维导图生成流程

1. 接收用户主题
2. 使用DeepSeek AI生成结构化内容
3. 保存到本地文件
4. 上传到AWS S3（可选）
5. 返回结果

### 错误处理

- S3上传失败时，会返回本地文件路径
- 所有生成的内容都会保存在本地
- 提供详细的错误日志

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！