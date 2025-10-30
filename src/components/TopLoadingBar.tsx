'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import '@/styles/nprogress-custom.css';

// 配置 NProgress
NProgress.configure({ 
  showSpinner: false, // 不显示右上角的旋转图标
  trickleSpeed: 100,  // 进度条速度
  minimum: 0.1,       // 最小百分比
  easing: 'ease',     // 动画效果
  speed: 300,         // 动画速度
});

// 进度条超时保护
let progressTimeout: NodeJS.Timeout | null = null;

// 包装 NProgress.start，添加超时保护
const safeStart = () => {
  NProgress.start();
  
  // 清除之前的超时
  if (progressTimeout) {
    clearTimeout(progressTimeout);
  }
  
  // 设置5秒超时，自动完成进度条
  progressTimeout = setTimeout(() => {
    NProgress.done();
    progressTimeout = null;
  }, 5000);
};

// 包装 NProgress.done，清除超时
const safeDone = () => {
  if (progressTimeout) {
    clearTimeout(progressTimeout);
    progressTimeout = null;
  }
  NProgress.done();
};

/**
 * 全局顶部加载进度条组件
 * 监听路由变化，自动显示/隐藏进度条
 */
export default function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 路由变化时，完成进度条
    safeDone();
  }, [pathname, searchParams]);

  useEffect(() => {
    // 监听页面隐藏/显示事件，确保进度条正确重置
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 页面隐藏时，重置进度条
        safeDone();
      }
    };

    // 监听页面卸载，确保进度条完成
    const handleBeforeUnload = () => {
      safeDone();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // 监听链接点击事件
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      const clickedElement = event.target as HTMLElement;
      
      // 排除以下情况，避免和按钮 loading 冲突：
      // 1. 带有 data-no-progress 属性的链接（手动排除）
      if (target.hasAttribute('data-no-progress')) {
        return;
      }
      
      // 2. 检查点击的元素是否是按钮或在按钮内部
      if (
        clickedElement.tagName === 'BUTTON' ||
        clickedElement.closest('button') ||
        clickedElement.classList.contains('ant-btn') ||
        clickedElement.closest('.ant-btn')
      ) {
        return; // 跳过按钮，使用按钮自己的 loading 状态
      }

      // 3. 检查目标链接本身是否是按钮样式
      if (
        target.tagName === 'BUTTON' ||
        target.classList.contains('ant-btn')
      ) {
        return;
      }

      // 4. 检查是否是真正的页面跳转
      if (target.href && target.href !== window.location.href) {
        try {
          const targetUrl = new URL(target.href);
          const currentUrl = new URL(window.location.href);
          
          // 只对不同页面的跳转显示进度条
          if (targetUrl.pathname !== currentUrl.pathname) {
            safeStart();
          }
        } catch (e) {
          // URL 解析失败，可能是相对路径或特殊链接，跳过
          return;
        }
      }
    };

    const handleMutation = () => {
      const anchors = document.querySelectorAll('a[href]');
      anchors.forEach((anchor) => {
        anchor.addEventListener('click', handleAnchorClick as EventListener);
      });
    };

    // 初始化
    handleMutation();

    // 监听 DOM 变化（动态添加的链接）
    const observer = new MutationObserver(handleMutation);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      const anchors = document.querySelectorAll('a[href]');
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleAnchorClick as EventListener);
      });
    };
  }, []);

  // 组件卸载时清理进度条
  useEffect(() => {
    return () => {
      safeDone();
    };
  }, []);

  return null; // 不渲染任何内容，只是监听路由变化
}

