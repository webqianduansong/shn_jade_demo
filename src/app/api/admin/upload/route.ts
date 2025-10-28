import { NextRequest, NextResponse } from 'next/server';
import { getUploadAdapter } from '@/lib/uploadAdapter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    
    if (!(file instanceof Blob)) {
      return NextResponse.json({ success: false, message: '未收到文件' }, { status: 400 });
    }
    
    // 校验类型与大小
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ success: false, message: '仅支持 JPG/PNG/WebP/GIF 图片' }, { status: 400 });
    }
    
    const maxSize = 2 * 1024 * 1024; // 2MB
    if ((file as any).size && (file as any).size > maxSize) {
      return NextResponse.json({ success: false, message: '图片大小不能超过 2MB' }, { status: 400 });
    }
    
    // 生成唯一文件名
    const ext = mimeFromType(file.type) || '.bin';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    
    // 使用适配器上传（自动根据环境选择存储方式）
    const adapter = getUploadAdapter();
    const url = await adapter.upload(file as File, filename);
    
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : '上传失败' 
    }, { status: 500 });
  }
}

function mimeFromType(type: string | undefined | null) {
  if (!type) return undefined;
  if (type.includes('png')) return '.png';
  if (type.includes('jpeg') || type.includes('jpg')) return '.jpg';
  if (type.includes('webp')) return '.webp';
  if (type.includes('gif')) return '.gif';
  return undefined;
}


