import type { ReactNode } from 'react';

/**
 * 登录页专用 Layout
 * 不包含任何权限验证，避免重定向循环
 */
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

