"use client";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Row, Col, Card, Upload, Tag } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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

type Product = {
  id: string;
  name: string;
  price: number; // cents
  description?: string | null;
  sku?: string | null;
  model?: string | null;
  rating?: number;
  reviewsCount?: number;
  category?: { id: string; name: string } | null;
  categoryId?: string | null;
  images?: { id: string; url: string; sortOrder?: number }[];
};

type AdminFormValues = Product & {
  models?: string[]; // 用于多型号输入（仅表单层）
};

type Category = { id: string; name: string };

export default function ProductsClient({ products, categories, locale }: { products: Product[]; categories: Category[]; locale: string }) {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm<AdminFormValues>();
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(products.length);
  const [remoteData, setRemoteData] = useState<Product[]>(products);
  const [loadingTable, setLoadingTable] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const isMobile = useIsMobile();

  // 移动端简化列配置
  const mobileColumns = useMemo(() => ([
    {
      title: '商品信息',
      dataIndex: 'name',
      key: 'info',
      width: 200,
      render: (_: any, r: Product) => (
        <div className="mobile-product-cell">
          <div className="mobile-product-name">{r.name}</div>
          <div className="mobile-product-meta">
            {r.sku && <span className="mobile-product-sku">SKU: {r.sku}</span>}
            {r.category && <Tag color="blue" style={{ marginLeft: 8 }}>{r.category.name}</Tag>}
          </div>
        </div>
      )
    },
    {
      title: '价格/操作',
      dataIndex: 'price',
      key: 'actions',
      width: 140,
      render: (_: any, r: Product) => (
        <div className="mobile-product-actions">
          <div className="mobile-product-price">¥{(r.price / 100).toFixed(2)}</div>
          <Space size={4} style={{ marginTop: 8 }}>
            <Button 
              type="link" 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(r)}
              style={{ padding: '0 4px' }}
            />
            <Popconfirm 
              title="确认删除？" 
              onConfirm={() => onDelete(r.id)} 
              okText="删除" 
              cancelText="取消"
            >
              <Button 
                type="link" 
                size="small" 
                danger 
                icon={<DeleteOutlined />}
                style={{ padding: '0 4px' }}
              />
            </Popconfirm>
          </Space>
        </div>
      )
    },
  ]), []);

  // 桌面端完整列配置
  const desktopColumns = useMemo(() => ([
    { title: '名称', dataIndex: 'name', width: 180 },
    { title: 'SKU', dataIndex: 'sku', width: 120 },
    { title: '型号', dataIndex: 'model', width: 100 },
    { title: '评分', dataIndex: 'rating', width: 80, render: (v: number) => (v ?? 0).toFixed(1) },
    { title: '评论数', dataIndex: 'reviewsCount', width: 80 },
    { title: '分类', dataIndex: ['category', 'name'], width: 120 },
    { title: '金额(CNY)', dataIndex: 'price', width: 100, render: (v: number) => (v / 100).toFixed(2) },
    { title: '操作', key: 'actions', width: 220, fixed: 'right', render: (_: any, r: Product) => (
      <Space size={4}>
        <Button 
          size="small" 
          className="jade-btn" 
          onClick={() => onEdit(r)}
        >
          编辑
        </Button>
        <Popconfirm title="确认删除该商品？" onConfirm={() => onDelete(r.id)} okText="删除" cancelText="取消">
          <Button size="small" danger>删除</Button>
        </Popconfirm>
        <Link href={`/${locale}/products/${r.id}`}>
          <Button size="small" className="jade-btn-outline">查看</Button>
        </Link>
      </Space>
    ) },
  ]), [locale]);

  const columns = isMobile ? mobileColumns : desktopColumns;

  // 批量删除
  const onBulkDelete = async () => {
    if (!selectedRowKeys.length) return message.info('请选择要删除的商品');
    await fetch('/api/admin/products/bulk', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ action: 'delete', ids: selectedRowKeys }) 
    });
    message.success('批量删除成功');
    setSelectedRowKeys([]);
    window.location.reload();
  };

  // 批量调价
  const onBulkReprice = async (percent: number) => {
    if (!selectedRowKeys.length) return message.info('请选择要调整的商品');
    await fetch('/api/admin/products/bulk', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ action: 'repricePercent', ids: selectedRowKeys, payload: { percent } }) 
    });
    message.success('批量调价成功');
    setSelectedRowKeys([]);
    window.location.reload();
  };

  const onCreate = () => {
    setEditing(null);
    form.resetFields();
    setImageUrls([]);
    setOpen(true);
  };

  const onEdit = (p: Product) => {
    setEditing(p);
    const urls = (p.images || [])
      .slice()
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((img) => img.url);
    setImageUrls(urls);
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      message.success('删除成功');
      window.location.reload();
    } else {
      message.error('删除失败');
    }
  };

  const onOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      const payload: any = {
        name: values.name,
        categoryId: values.categoryId,
        price: Math.round(Number(values.price as any) * 100),
        description: values.description,
        sku: values.sku,
        model: Array.isArray(values.models)
          ? values.models.filter(Boolean).join(',')
          : values.model || undefined,
        rating: values.rating,
        reviewsCount: values.reviewsCount,
        images: imageUrls,
        id: editing?.id,
      };
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        message.success(editing ? '更新成功' : '创建成功');
        setOpen(false);
        window.location.reload();
      } else {
        let errorMessage = '提交失败';
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const data = await res.json();
            errorMessage = data?.message || errorMessage;
          } else {
            const text = await res.text();
            if (text) errorMessage = text;
          }
        } catch {}
        message.error(errorMessage);
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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
      if (data?.url) setImageUrls((arr) => [...arr, data.url]);
      else message.error('上传失败');
    } finally {
      setUploading(false);
    }
    return false; // 阻止 antd 自动上传
  };

  const removeImage = (idx: number) => {
    setImageUrls((arr) => arr.filter((_, i) => i !== idx));
  };

  const moveImage = (from: number, to: number) => {
    setImageUrls((arr) => {
      const copy = arr.slice();
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const query = useMemo(() => ({ page, pageSize, q: keyword, categoryId, minPrice, maxPrice, sortField: 'createdAt', sortOrder: 'desc' as const }), [page, pageSize, keyword, categoryId, minPrice, maxPrice]);

  const fetchList = async () => {
    setLoadingTable(true);
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') params.set(k, String(v)); });
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      setRemoteData(data.list || []);
      setTotal(data.total || 0);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => { fetchList(); }, [query.page, query.pageSize, query.q, query.categoryId, query.minPrice, query.maxPrice]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>商品管理</h2>
        <Space wrap>
          <Button className="jade-btn-primary" onClick={onCreate}>新增商品</Button>
        </Space>
      </div>

      <Card bordered={false} style={{ marginBottom: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={10}>
            <Input 
              allowClear 
              placeholder={isMobile ? "搜索..." : "搜索名称/描述"} 
              value={keyword} 
              onChange={(e) => setKeyword(e.target.value)} 
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select 
              allowClear 
              style={{ width: '100%' }} 
              placeholder="分类筛选" 
              value={categoryId} 
              onChange={setCategoryId} 
              options={categories.map((c) => ({ value: c.id, label: c.name }))} 
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder={isMobile ? "最低" : "最低价(元)"} 
              value={minPrice} 
              onChange={(v) => setMinPrice(v ?? undefined)} 
              min={0} 
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder={isMobile ? "最高" : "最高价(元)"} 
              value={maxPrice} 
              onChange={(v) => setMaxPrice(v ?? undefined)} 
              min={0} 
            />
          </Col>
        </Row>
      </Card>

      {!isMobile && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : '批量操作：'}
          </span>
          <Space>
            <Popconfirm 
              title="确认删除选中的商品？" 
              onConfirm={onBulkDelete}
              disabled={selectedRowKeys.length === 0}
            >
              <Button 
                danger 
                disabled={selectedRowKeys.length === 0}
              >
                批量删除
              </Button>
            </Popconfirm>
            <Button 
              className="jade-btn-outline"
              onClick={() => onBulkReprice(10)}
              disabled={selectedRowKeys.length === 0}
            >
              调价 +10%
            </Button>
            <Button 
              className="jade-btn-outline"
              onClick={() => onBulkReprice(-10)}
              disabled={selectedRowKeys.length === 0}
            >
              调价 -10%
            </Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        dataSource={remoteData}
        columns={columns as any}
        rowSelection={isMobile ? undefined : {
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        loading={loadingTable}
        pagination={{ 
          pageSize, 
          current: page, 
          total, 
          showSizeChanger: false, 
          onChange: (p) => setPage(p),
          simple: isMobile,
          size: isMobile ? 'small' : 'default'
        }}
        scroll={isMobile ? { x: 'max-content' } : { x: 1400 }}
        size={isMobile ? 'small' : 'middle'}
      />

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={open}
        confirmLoading={confirmLoading}
        onOk={onOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          preserve={false}
          initialValues={
            editing
              ? {
                  name: editing.name,
                  categoryId: editing.category?.id || editing.categoryId,
                  price: (editing.price || 0) / 100,
                  description: editing.description || undefined,
                  sku: editing.sku || undefined,
                  models: (editing.model || '')
                    ? String(editing.model)
                        .split(/[\,\|/;]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : undefined,
                  rating: editing.rating ?? 0,
                  reviewsCount: editing.reviewsCount ?? 0,
                }
              : { rating: 0, reviewsCount: 0 }
          }
        >
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="sku" label="SKU">
                <Input placeholder="例如 021-01" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
                <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="请选择分类" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="price" label="价格（元）" rules={[{ required: true }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="models" label="型号（可多值，输入后回车）">
                <Select
                  mode="tags"
                  tokenSeparators={[',', ';', '/', '|']}
                  placeholder={'输入型号后回车，可输入多个，如 1/2" Single'}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="rating" label="评分" tooltip="0-5">
                <InputNumber min={0} max={5} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="reviewsCount" label="评论数">
                <InputNumber min={0} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="商品描述" />
          </Form.Item>
          <Form.Item label="商品图片（可上传并拖动排序）">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload beforeUpload={handleUpload} showUploadList={false} multiple>
                <Button icon={<UploadOutlined />} loading={uploading}>上传图片</Button>
              </Upload>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {imageUrls.map((url, idx) => (
                  <div key={url} style={{ position: 'relative', width: 96, height: 96, border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden' }}>
                    <img src={url} alt="img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', right: 4, top: 4, display: 'flex', gap: 4 }}>
                      <Button size="small" onClick={() => moveImage(idx, Math.max(0, idx - 1))}>↑</Button>
                      <Button size="small" onClick={() => moveImage(idx, Math.min(imageUrls.length - 1, idx + 1))}>↓</Button>
                      <Button size="small" danger onClick={() => removeImage(idx)}>删</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


