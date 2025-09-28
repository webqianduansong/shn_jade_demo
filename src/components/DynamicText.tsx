"use client";
import React from 'react';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

interface DynamicTextProps {
  children: string;
  className?: string;
  fallback?: string;
}

export default function DynamicText({ 
  children, 
  className = '', 
  fallback 
}: DynamicTextProps) {
  const { translatedText, isLoading } = useDynamicTranslation(children);

  if (isLoading && fallback) {
    return <span className={className}>{fallback}</span>;
  }

  return <span className={className}>{translatedText}</span>;
}

// 用于标题的动态翻译组件
export function DynamicTitle({ 
  children, 
  className = '', 
  level = 1 
}: DynamicTextProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const { translatedText, isLoading } = useDynamicTranslation(children);
  
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  
  return <Tag className={className}>{translatedText}</Tag>;
}

// 用于段落的动态翻译组件
export function DynamicParagraph({ 
  children, 
  className = '' 
}: DynamicTextProps) {
  const { translatedText, isLoading } = useDynamicTranslation(children);
  
  return <p className={className}>{translatedText}</p>;
}
