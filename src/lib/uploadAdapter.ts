/**
 * 图片上传适配器 - 支持本地存储、Cloudflare R2 和 AWS S3
 * 
 * 使用环境变量控制:
 * - 无配置或本地开发: 使用本地文件系统
 * - R2_ENDPOINT 配置: 使用 Cloudflare R2
 * - AWS_S3_BUCKET 配置: 使用 AWS S3
 */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export interface UploadAdapter {
  upload(file: File, filename: string): Promise<string>;
  delete(url: string): Promise<void>;
}

/**
 * 本地文件系统适配器（仅用于开发环境）
 */
export class LocalAdapter implements UploadAdapter {
  async upload(file: File, filename: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    // 本地删除实现
    const filename = url.split('/').pop();
    if (!filename) return;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    try {
      const { unlink } = await import('node:fs/promises');
      await unlink(filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  }
}

/**
 * Cloudflare R2 适配器（推荐用于生产环境）
 */
export class R2Adapter implements UploadAdapter {
  private endpoint: string;
  private bucketName: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private publicUrl: string;

  constructor() {
    this.endpoint = process.env.R2_ENDPOINT!;
    this.bucketName = process.env.R2_BUCKET_NAME!;
    this.accessKeyId = process.env.R2_ACCESS_KEY_ID!;
    this.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;

    if (!this.endpoint || !this.bucketName || !this.accessKeyId || !this.secretAccessKey) {
      throw new Error('R2 配置不完整，请检查环境变量');
    }
  }

  async upload(file: File, filename: string): Promise<string> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    const arrayBuffer = await file.arrayBuffer();
    
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      })
    );

    return `${this.publicUrl}/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const filename = url.split('/').pop();
    if (!filename) return;

    const client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    await client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      })
    );
  }
}

/**
 * AWS S3 适配器
 */
export class S3Adapter implements UploadAdapter {
  private bucketName: string;
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET!;
    this.region = process.env.AWS_S3_REGION || 'us-east-1';
    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

    if (!this.bucketName || !this.accessKeyId || !this.secretAccessKey) {
      throw new Error('S3 配置不完整，请检查环境变量');
    }
  }

  async upload(file: File, filename: string): Promise<string> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    const arrayBuffer = await file.arrayBuffer();
    
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
      })
    );

    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const filename = url.split('/').pop();
    if (!filename) return;

    const client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    await client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
      })
    );
  }
}

/**
 * 获取当前环境配置的上传适配器
 * 优先级：R2 > S3 > Local
 */
export function getUploadAdapter(): UploadAdapter {
  // 检查是否配置了 R2
  if (process.env.R2_ENDPOINT && process.env.R2_BUCKET_NAME) {
    console.log('使用 Cloudflare R2 存储');
    return new R2Adapter();
  }
  
  // 检查是否配置了 S3
  if (process.env.AWS_S3_BUCKET) {
    console.log('使用 AWS S3 存储');
    return new S3Adapter();
  }
  
  // 默认使用本地存储（仅开发环境）
  console.log('使用本地文件系统存储（仅适用于开发环境）');
  return new LocalAdapter();
}

