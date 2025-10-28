import { message } from 'antd';

/**
 * 统一的 API 请求封装
 * 自动处理错误并显示提示
 */
export async function apiClient<T = any>(
  url: string,
  options?: RequestInit & { 
    showError?: boolean; 
    errorMessage?: string;
    showSuccess?: boolean;
    successMessage?: string;
  }
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { 
    showError = true, 
    errorMessage, 
    showSuccess = false,
    successMessage,
    ...fetchOptions 
  } = options || {};

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // 处理非 200 响应
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || errorMessage || `请求失败 (${response.status})`;
      
      if (showError) {
        message.error(errorMsg);
      }
      
      return { success: false, error: errorMsg };
    }

    const data = await response.json();

    // 检查业务逻辑错误
    if (data.success === false) {
      const errorMsg = data.message || data.error || errorMessage || '操作失败';
      
      if (showError) {
        message.error(errorMsg);
      }
      
      return { success: false, error: errorMsg };
    }

    // 成功提示
    if (showSuccess && successMessage) {
      message.success(successMessage);
    }

    return { success: true, data };
  } catch (error) {
    const errorMsg = errorMessage || '网络请求失败，请检查网络连接';
    
    if (showError) {
      message.error(errorMsg);
    }
    
    console.error('API Client Error:', error);
    return { success: false, error: errorMsg };
  }
}

/**
 * GET 请求
 */
export async function apiGet<T = any>(
  url: string,
  options?: Omit<Parameters<typeof apiClient>[1], 'method' | 'body'>
) {
  return apiClient<T>(url, { ...options, method: 'GET' });
}

/**
 * POST 请求
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  options?: Omit<Parameters<typeof apiClient>[1], 'method' | 'body'>
) {
  return apiClient<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 请求
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  options?: Omit<Parameters<typeof apiClient>[1], 'method' | 'body'>
) {
  return apiClient<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 请求
 */
export async function apiDelete<T = any>(
  url: string,
  options?: Omit<Parameters<typeof apiClient>[1], 'method' | 'body'>
) {
  return apiClient<T>(url, { ...options, method: 'DELETE' });
}

