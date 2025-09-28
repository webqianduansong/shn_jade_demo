"use client";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { message } from 'antd';

/**
 * 通知组件属性接口
 */
interface NotificationProps {
  message: string; // 通知消息内容
  type: 'success' | 'error' | 'info'; // 通知类型
  isVisible: boolean; // 是否显示通知
  onClose: () => void; // 关闭通知的回调函数
  duration?: number; // 通知显示时长（毫秒）
}

/**
 * 通知组件
 * 用于显示成功、错误或信息提示
 */
export default function Notification({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 3000 
}: NotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false); // 动画状态

  // 处理通知显示和自动关闭
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // 等待动画完成
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  /**
   * 根据通知类型获取样式类名
   * @returns 对应的CSS类名
   */
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'info':
        return 'bg-blue-500 text-white border-blue-600';
      default:
        return 'bg-gray-500 text-white border-gray-600';
    }
  };

  /**
   * 根据通知类型获取图标
   * @returns 对应的SVG图标
   */
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          ${getTypeStyles()}
          px-6 py-4 rounded-lg shadow-lg border-l-4 flex items-center space-x-3
          transform transition-all duration-300 ease-in-out
          ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * 通知管理Hook
 * 使用 Ant Design 的 message 组件
 */
export function useNotification() {
  /**
   * 显示通知
   * @param messageText 通知消息
   * @param type 通知类型，默认为'info'
   */
  const showNotification = (messageText: string, type: 'success' | 'error' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        message.success(messageText);
        break;
      case 'error':
        message.error(messageText);
        break;
      case 'info':
        message.info(messageText);
        break;
      default:
        message.info(messageText);
    }
  };

  /**
   * 通知容器组件（使用 Ant Design 时不需要自定义容器）
   */
  const NotificationContainer = () => null;

  return { showNotification, NotificationContainer };
}
