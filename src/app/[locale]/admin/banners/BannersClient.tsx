"use client";
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, message, Upload, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface Banner {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BannersClientProps {
  banners: Banner[];
}

export default function BannersClient({ banners: initialBanners }: BannersClientProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // 同步初始数据
  useEffect(() => {
    if (initialBanners && initialBanners.length >= 0) {
      setBanners(initialBanners);
    }
  }, [initialBanners]);

  // 刷新列表
  const refreshBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error('刷新轮播图失败:', error);
    }
  };

  // 上传图片
  const handleUpload = async (file: File) => {
    const accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!accept.includes(file.type)) {
      message.error('仅支持 JPG/PNG/WebP/GIF 图片');
      return false;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error('图片大小不能超过 5MB');
      return false;
    }

    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setImageUrl(data.url);
          form.setFieldsValue({ imageUrl: data.url });
          message.success('图片上传成功');
        } else {
          message.error('上传失败，返回的数据无效');
        }
      } else {
        message.error('上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
    return false; // 阻止 antd 自动上传
  };

  // 打开新增模态框
  const handleCreate = () => {
    setEditingBanner(null);
    setImageUrl('');
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setImageUrl(banner.imageUrl);
    form.setFieldsValue({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    });
    setModalVisible(true);
  };

  // 删除轮播图
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个轮播图吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`/api/admin/banners?id=${id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            message.success('删除成功');
            await refreshBanners();
          } else {
            message.error(data.error || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const method = editingBanner ? 'PATCH' : 'POST';
      const body = editingBanner
        ? { id: editingBanner.id, ...values }
        : values;

      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        message.success(data.message || '操作成功');
        setModalVisible(false);
        form.resetFields();
        setImageUrl('');
        await refreshBanners();
      } else {
        message.error(data.error || '操作失败');
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        // 表单验证错误，不显示消息
        return;
      }
      console.error('操作失败:', error);
      message.error('操作失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (url: string) => (
        <Image
          src={url}
          alt="轮播图"
          width={100}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string | null) => text || '-',
    },
    {
      title: '跳转地址',
      dataIndex: 'linkUrl',
      key: 'linkUrl',
      render: (text: string | null) => text || '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
          {isActive ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: Banner) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>轮播图管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增轮播图
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBanner ? '编辑轮播图' : '新增轮播图'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setImageUrl('');
        }}
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            sortOrder: 0,
            isActive: true,
          }}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>

          <Form.Item
            label="图片"
            name="imageUrl"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <div>
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
                <div style={{ marginTop: 16 }}>
                  <Image
                    src={imageUrl}
                    alt="预览"
                    width={200}
                    style={{ borderRadius: 4 }}
                  />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item label="跳转地址" name="linkUrl">
            <Input placeholder="请输入跳转地址（可选）" />
          </Form.Item>

          <Form.Item
            label="排序"
            name="sortOrder"
            tooltip="数字越小越靠前"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

