"use client";
import { Table, Button, Space, message, Tag, Modal, Form, Input, Upload, Image } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState, useCallback } from 'react';
import type { ColumnsType } from 'antd/es/table';

// 响应式钩子
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

type Category = { id: string; name: string; slug: string; image?: string | null; _count?: { products: number } };

export default function CategoriesClient({ categories: initialCategories }: { categories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const isMobile = useIsMobile();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // 刷新分类列表
  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('刷新分类列表失败:', error);
    }
  }, []);

  // 执行删除操作
  const performDelete = useCallback(async (id: string, force: boolean) => {
    try {
      const url = `/api/admin/categories?id=${id}${force ? '&force=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        message.success(data.message || '删除成功');
        await refreshCategories();
      } else if (data.canForceDelete) {
        // 提示用户需要强制删除
        Modal.confirm({
          title: '分类下有商品',
          content: `${data.error}。是否强制删除该分类？删除后，这些商品将变为"无分类"状态。`,
          okText: '强制删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: async () => {
            await performDelete(id, true);
          }
        });
      } else {
        message.error(data.error || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  }, [refreshCategories]);

  // 图片上传处理
  const handleUpload = async (file: File) => {
    const accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!accept.includes(file.type)) {
      message.error('仅支持 JPG/PNG/WebP/GIF 图片');
      return Upload.LIST_IGNORE as unknown as boolean;
    }
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('图片大小不能超过 2MB');
      return Upload.LIST_IGNORE as unknown as boolean;
    }
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        let msg = '上传失败';
        if (ct.includes('application/json')) {
          const j = await res.json();
          msg = j?.message || msg;
        } else {
          msg = await res.text() || msg;
        }
        message.error(msg);
        return false;
      }
      const data = ct.includes('application/json') ? await res.json() : { url: await res.text() };
      if (data?.url) {
        setImageUrl(data.url);
        message.success('图片上传成功');
      } else {
        message.error('上传失败');
      }
    } finally {
      setUploading(false);
    }
    return false; // 阻止 antd 自动上传
  };

  // 新增分类
  const handleCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    setImageUrl('');
    setModalOpen(true);
  }, [form]);

  // 编辑分类
  const handleEdit = useCallback((category: Category) => {
    setEditing(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      productCount: category._count?.products || 0,
    });
    setImageUrl(category.image || '');
    setModalOpen(true);
  }, [form]);

  // 删除分类
  const handleDelete = useCallback(async (id: string, force: boolean = false) => {
    // 如果不是强制删除，先显示确认对话框
    if (!force) {
      const category = categories.find(c => c.id === id);
      const hasProducts = category?._count && category._count.products > 0;
      
      Modal.confirm({
        title: hasProducts ? '分类下有商品' : '确认删除',
        content: hasProducts 
          ? `该分类下有 ${category?._count?.products || 0} 个商品。删除后，这些商品将变为"无分类"状态。是否继续？`
          : '确认删除该分类？',
        okText: '删除',
        okType: hasProducts ? 'danger' : 'primary',
        cancelText: '取消',
        onOk: async () => {
          await performDelete(id, false);
        }
      });
      return;
    }
    
    await performDelete(id, force);
  }, [categories, performDelete]);

  // 移动端简化列配置
  const mobileColumns: ColumnsType<Category> = useMemo(() => [
    {
      title: '分类信息',
      dataIndex: 'name',
      key: 'info',
      render: (_, record) => (
        <div className="mobile-category-cell">
          <div className="mobile-category-name">
            <span>{record.name}</span>
            {record._count && record._count.products > 0 && (
              <Tag color="orange">
                {record._count.products}个商品
              </Tag>
            )}
          </div>
          <div className="mobile-category-slug">Slug: {record.slug}</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size={4}>
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: '0 4px' }}
          />
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            style={{ padding: '0 4px' }}
          />
        </Space>
      )
    }
  ], [handleEdit, handleDelete]);

  // 桌面端完整列配置
  const desktopColumns: ColumnsType<Category> = useMemo(() => [
    { 
      title: '名称', 
      dataIndex: 'name',
      width: 200
    },
    { 
      title: 'Slug', 
      dataIndex: 'slug',
      width: 200,
      render: (slug: string) => <Tag color="blue">{slug}</Tag>
    },
    {
      title: '商品数量',
      dataIndex: ['_count', 'products'],
      width: 120,
      render: (count: number) => count || 0
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button 
            size="small" 
            className="jade-btn"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            size="small" 
            danger
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ], [handleEdit, handleDelete]);

  const columns = isMobile ? mobileColumns : desktopColumns;

  // 执行批量删除操作
  const performBulkDelete = useCallback(async (force: boolean) => {
    try {
      const res = await fetch('/api/admin/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: selectedRowKeys, force }),
      });
      const data = await res.json();
      
      if (data.success) {
        message.success(data.message || '批量删除成功');
        setSelectedRowKeys([]);
        await refreshCategories();
      } else if (data.canForceDelete) {
        // 提示用户需要强制删除
        Modal.confirm({
          title: '部分分类下有商品',
          content: `${data.error}。是否强制删除这些分类？删除后，这些商品将变为"无分类"状态。`,
          okText: '强制删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: async () => {
            await performBulkDelete(true);
          }
        });
      } else {
        message.error(data.error || '批量删除失败');
      }
    } catch (error) {
      message.error('批量删除失败');
      console.error(error);
    }
  }, [selectedRowKeys, refreshCategories]);

  // 批量删除
  const onBulkDelete = useCallback(async (force: boolean = false) => {
    if (!selectedRowKeys.length) return message.info('请选择要删除的分类');
    
    // 如果不是强制删除，先显示确认对话框
    if (!force) {
      const selectedCategories = categories.filter(c => selectedRowKeys.includes(c.id));
      const totalProducts = selectedCategories.reduce((sum, c) => sum + (c._count?.products || 0), 0);
      
      Modal.confirm({
        title: totalProducts > 0 ? '部分分类下有商品' : '确认批量删除',
        content: totalProducts > 0
          ? `选中的分类下共有 ${totalProducts} 个商品。删除后，这些商品将变为"无分类"状态。是否继续？`
          : `确认删除选中的 ${selectedRowKeys.length} 个分类？`,
        okText: '删除',
        okType: totalProducts > 0 ? 'danger' : 'primary',
        cancelText: '取消',
        onOk: async () => {
          await performBulkDelete(false);
        }
      });
      return;
    }
    
    await performBulkDelete(force);
  }, [selectedRowKeys, categories, performBulkDelete]);

  // 提交表单
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const url = '/api/admin/categories';
      const method = editing ? 'PUT' : 'POST';
      const body = editing 
        ? { id: editing.id, ...values, image: imageUrl || null }
        : { ...values, image: imageUrl || null };

      console.log('提交数据:', body);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      console.log('响应状态:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('请求失败:', res.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          message.error(errorData.error || `请求失败: ${res.status}`);
        } catch {
          message.error(`请求失败: ${res.status} ${res.statusText}`);
        }
        return;
      }
      
      const data = await res.json();
      console.log('响应数据:', data);

      if (data.success) {
        message.success(editing ? '更新成功' : '创建成功');
        setModalOpen(false);
        form.resetFields();
        setImageUrl('');
        await refreshCategories();
      } else {
        const errorMsg = data.error || '操作失败';
        console.error('操作失败:', errorMsg, data);
        message.error(errorMsg);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        // 表单验证错误，不显示消息
        return;
      }
      console.error('提交失败:', error);
      message.error('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setConfirmLoading(false);
    }
  }, [form, editing, imageUrl, refreshCategories]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>分类管理</h2>
        <Space wrap>
          <Button className="jade-btn-primary" onClick={handleCreate}>新增分类</Button>
        </Space>
      </div>

      {!isMobile && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : '批量操作：'}
          </span>
          <Space>
            <Button 
              danger 
              disabled={selectedRowKeys.length === 0}
              onClick={() => onBulkDelete()}
            >
              批量删除
            </Button>
          </Space>
        </div>
      )}

      <Table 
        rowKey="id" 
        dataSource={categories} 
        columns={columns}
        rowSelection={isMobile ? undefined : {
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          simple: isMobile,
          size: isMobile ? 'small' : 'default'
        }}
        scroll={isMobile ? { x: 'max-content' } : undefined}
        size={isMobile ? 'small' : 'middle'}
      />

      <Modal
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setImageUrl('');
        }}
        confirmLoading={confirmLoading}
        okText={editing ? '更新' : '创建'}
        cancelText="取消"
        okButtonProps={{ className: 'jade-btn-primary' }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[
              { required: true, message: '请输入分类名称' },
              { min: 2, message: '分类名称至少2个字符' },
              { max: 50, message: '分类名称最多50个字符' },
            ]}
          >
            <Input placeholder="例如：玉镯、吊坠、挂件" />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { required: true, message: '请输入Slug' },
              { pattern: /^[a-z0-9-]+$/, message: 'Slug只能包含小写字母、数字和连字符' },
              { min: 2, message: 'Slug至少2个字符' },
              { max: 50, message: 'Slug最多50个字符' },
            ]}
            tooltip="Slug用于URL，只能包含小写字母、数字和连字符，例如：jade-bracelet"
          >
            <Input placeholder="jade-bracelet" />
          </Form.Item>

          <Form.Item
            label="分类图片"
            tooltip="上传分类封面图片，建议尺寸280x280，如不上传将使用该分类下第一个商品的图片"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload 
                beforeUpload={handleUpload} 
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {imageUrl ? '更换图片' : '上传图片'}
                </Button>
              </Upload>
              {imageUrl && (
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                  <Image
                    src={imageUrl}
                    alt="分类图片"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      borderRadius: 8
                    }}
                  />
                  <Button
                    size="small"
                    danger
                    onClick={() => setImageUrl('')}
                    style={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4 
                    }}
                  >
                    删除
                  </Button>
                </div>
              )}
            </Space>
          </Form.Item>

          {editing && (
            <Form.Item
              label="商品数量"
              name="productCount"
              tooltip="该分类下的商品数量，此字段为只读"
            >
              <Input 
                disabled 
                suffix={
                  <span style={{ color: '#999' }}>
                    {form.getFieldValue('productCount') > 0 
                      ? '删除分类时会清除商品的分类关联' 
                      : '可直接删除'}
                  </span>
                }
                style={{ 
                  background: '#f5f5f5',
                  color: '#666',
                  cursor: 'not-allowed'
                }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}


