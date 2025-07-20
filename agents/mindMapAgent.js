import { deepseek } from '@ai-sdk/deepseek';
import { Agent } from '@mastra/core/agent';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from "node:fs/promises";

/**
 * 思维导图生成智能体
 * 使用DeepSeek API生成思维导图内容
 */
class MindMapAgent {
  constructor() {
    // 初始化Mastra智能体
    this.agent = new Agent({
      name: 'MindMapAgent',
      instructions: `
        你是一个专业的思维导图生成助手，擅长创建结构化的思维导图内容。

        当用户提供一个主题时，你应该：
        - 生成5-7个与主题相关的主要方面或类别
        - 为每个主要方面生成3-5个详细的子主题
        - 确保所有内容都以JSON格式返回
        - 保持结构清晰、逻辑连贯
        - 确保内容丰富且有洞察力
      `,
      model: deepseek('deepseek-chat')
    });

    // 初始化S3客户端
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * 上传文件到S3
   * @param {string} filepath 本地文件路径
   * @param {string} filename 文件名
   * @returns {Promise<string>} 返回S3 URL
   * @private
   */
  async uploadToS3 (filepath, filename) {
    try {
      console.log('开始上传文件到S3:', filename);

      // 检查文件是否存在
      if (!fs.existsSync(filepath)) {
        throw new Error(`文件不存在: ${filepath}`);
      }

      // 检查文件大小
      const stats = fs.statSync(filepath);
      console.log('文件大小:', stats.size, '字节');

      const bucketName = process.env.AWS_S3_BUCKET;

      if (!bucketName) {
        throw new Error('AWS_S3_BUCKET 环境变量未设置');
      }

      // 创建文件读取流
      const fileStream = fs.createReadStream(filepath);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: await readFile(filepath),
      });

      await this.s3Client.send(command);

      const s3Url = `https://${bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filename}`;

      console.log('文件已上传到S3:', s3Url);

      return s3Url;
    } catch (error) {
      console.error('上传到S3失败:', error);
      throw error;
    }
  }

  /**
   * 生成思维导图
   * @param {string} topic 主题
   * @returns {Promise<Object>} 返回包含文件路径和内容的对象
   */
  async generateMindMap (topic) {
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

      const response = await this.agent.generate(prompt);

      return response.text

      // // 创建输出目录
      // const outputDir = path.join(process.cwd(), 'outputs');
      // if (!fs.existsSync(outputDir)) {
      //   fs.mkdirSync(outputDir, { recursive: true });
      // }

      // // 生成文件名
      // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      // const safeTopic = topic.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
      // const filename = `mindmap_${safeTopic}_${timestamp}.txt`;
      // const filepath = path.join(outputDir, filename);

      // // 写入文件内容
      // fs.writeFileSync(filepath, response.text, 'utf8');

      // console.log('思维导图已保存到文件:', filepath);

      // // 上传到S3
      // let s3Result = null;
      // try {
      //   s3Result = await this.uploadToS3(filepath, filename);
      // } catch (s3Error) {
      //   console.warn('S3上传失败，但本地文件已保存:', s3Error.message);
      //   // 当S3上传失败时，返回本地文件路径
      //   s3Result = filepath;
      // }

      // return s3Result;

    } catch (error) {
      console.error('生成思维导图内容时出错:', error);
      throw error;
    }
  }
}

// 导出单例
export const mindMapAgent = new MindMapAgent();