import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/apiClient';

/**
 * 管理员身份验证 Hook
 * 在管理页面中使用，自动验证用户身份
 * 如果验证失败（401/403），自动跳转到登录页
 * 
 * @returns {Object} { isAuthenticating: boolean, userEmail: string }
 * - isAuthenticating: 是否正在验证身份（true 时应显示 loading）
 * - userEmail: 管理员邮箱（验证成功后返回）
 */
export function useAdminAuth() {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as string) || 'zh';
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsAuthenticating(true);
    
    const result = await apiGet('/api/admin/me', { showError: false });
    
    if (result.success && result.data?.user) {
      // 验证成功
      setUserEmail(result.data.user.email);
      setIsAuthenticating(false);
    } else {
      // 验证失败，清除 cookie 并跳转到登录页
      console.warn('[Admin Auth] 验证失败，跳转到登录页');
      document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = `/${locale}/admin/login`;
    }
  };

  return { isAuthenticating, userEmail };
}

