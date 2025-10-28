import { NextRequest, NextResponse } from 'next/server';
import { translateText, SupportedLanguage } from '@/lib/translation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang, sourceLang = 'en' } = await req.json();
    
    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing text or targetLang' }, 
        { status: 400 }
      );
    }

    const translatedText = await translateText(
      text, 
      targetLang as SupportedLanguage, 
      sourceLang as SupportedLanguage
    );

    return NextResponse.json({ 
      originalText: text,
      translatedText,
      sourceLang,
      targetLang 
    });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');
  const targetLang = req.nextUrl.searchParams.get('targetLang');
  const sourceLang = req.nextUrl.searchParams.get('sourceLang') || 'en';

  if (!text || !targetLang) {
    return NextResponse.json(
      { error: 'Missing text or targetLang parameter' }, 
      { status: 400 }
    );
  }

  try {
    const translatedText = await translateText(
      text, 
      targetLang as SupportedLanguage, 
      sourceLang as SupportedLanguage
    );

    return NextResponse.json({ 
      originalText: text,
      translatedText,
      sourceLang,
      targetLang 
    });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' }, 
      { status: 500 }
    );
  }
}
