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

/**
 * 全局顶部加载进度条组件
 * 监听路由变化，自动显示/隐藏进度条
 */
export default function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 路由变化时，完成进度条
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // 监听链接点击事件
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLAnchorElement;
      
      // 排除以下情况，避免和按钮 loading 冲突：
      // 1. 带有 data-no-progress 属性的链接（手动排除）
      // 2. 按钮触发的链接
      // 3. 相同页面的锚点链接
      if (target.hasAttribute('data-no-progress')) {
        return;
      }
      
      // 检查是否是按钮包裹的链接或按钮样式的链接
      if (
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.classList.contains('ant-btn') ||
        target.closest('.ant-btn')
      ) {
        return; // 跳过按钮，使用按钮自己的 loading 状态
      }

      // 检查是否是真正的页面跳转
      if (target.href && target.href !== window.location.href) {
        const targetUrl = new URL(target.href);
        const currentUrl = new URL(window.location.href);
        
        // 只对不同页面的跳转显示进度条
        if (targetUrl.pathname !== currentUrl.pathname) {
          NProgress.start();
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

  return null; // 不渲染任何内容，只是监听路由变化
}

