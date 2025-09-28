import { NextRequest, NextResponse } from 'next/server';
import { translateText, SupportedLanguage } from '@/lib/translation';

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
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  const targetLang = searchParams.get('targetLang');
  const sourceLang = searchParams.get('sourceLang') || 'en';

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
