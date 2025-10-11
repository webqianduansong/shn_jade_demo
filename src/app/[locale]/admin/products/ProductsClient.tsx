"use client";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Row, Col, Card, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number; // cents
  description?: string | null;
  category?: { id: string; name: string };
  categoryId?: string;
  images?: { id: string; url: string; sortOrder?: number }[];
};

type Category = { id: string; name: string };

export default function ProductsClient({ products, categories, locale }: { products: Product[]; categories: Category[]; locale: string }) {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm<Product>();
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(products.length);
  const [remoteData, setRemoteData] = useState<Product[]>(products);
  const [loadingTable, setLoadingTable] = useState(false);

  const columns = useMemo(() => ([
    { title: '名称', dataIndex: 'name' },
    { title: '分类', dataIndex: ['category', 'name'] },
    { title: '金额(CNY)', dataIndex: 'price', render: (v: number) => (v / 100).toFixed(2) },
    { title: '操作', key: 'actions', render: (_: any, r: Product) => (
      <Space>
        <a onClick={() => onEdit(r)}>编辑</a>
        <Popconfirm title="确认删除该商品？" onConfirm={() => onDelete(r.id)} okText="删除" cancelText="取消">
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Popconfirm>
        <Link href={`/${locale}/products/${r.id}`}>前台查看</Link>
      </Space>
    ) },
  ]), [locale]);

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
      const payload = {
        ...values,
        price: Math.round(Number(values.price) * 100),
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>商品管理</h2>
        <Button type="primary" onClick={onCreate}>新增商品</Button>
      </div>

      <Card bordered={false} style={{ marginBottom: 12 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={10}>
            <Input allowClear placeholder="搜索名称/描述" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </Col>
          <Col xs={12} md={6}>
            <Select allowClear style={{ width: '100%' }} placeholder="分类筛选" value={categoryId} onChange={setCategoryId} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Col>
          <Col xs={12} md={4}>
            <InputNumber style={{ width: '100%' }} placeholder="最低价(元)" value={minPrice} onChange={(v) => setMinPrice(v ?? undefined)} min={0} />
          </Col>
          <Col xs={12} md={4}>
            <InputNumber style={{ width: '100%' }} placeholder="最高价(元)" value={maxPrice} onChange={(v) => setMaxPrice(v ?? undefined)} min={0} />
          </Col>
        </Row>
      </Card>

      <Table
        rowKey="id"
        dataSource={remoteData}
        columns={columns as any}
        rowSelection={{}}
        loading={loadingTable}
        pagination={{ pageSize, current: page, total, showSizeChanger: false, onChange: (p) => setPage(p) }}
        footer={(selection) => {
          const keys = (selection as any)?.selectedRowKeys || [];
          const onBulkDelete = async () => {
            if (!keys.length) return message.info('请选择要删除的商品');
            await fetch('/api/admin/products/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', ids: keys }) });
            message.success('批量删除成功');
            window.location.reload();
          };
          const onBulkReprice = async (percent: number) => {
            if (!keys.length) return message.info('请选择要调整的商品');
            await fetch('/api/admin/products/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'repricePercent', ids: keys, payload: { percent } }) });
            message.success('批量调价成功');
            window.location.reload();
          };
          return (
            <Space>
              <Button danger onClick={onBulkDelete}>批量删除</Button>
              <Button onClick={() => onBulkReprice(10)}>所有选中 +10%</Button>
              <Button onClick={() => onBulkReprice(-10)}>所有选中 -10%</Button>
            </Space>
          );
        }}
      />

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={open}
        confirmLoading={confirmLoading}
        onOk={onOk}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Form layout="vertical" form={form} preserve={false} initialValues={editing ? { name: editing.name, categoryId: editing.category?.id || editing.categoryId, price: (editing.price || 0) / 100, description: editing.description || undefined } : undefined}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
            <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="请选择分类" />
          </Form.Item>
          <Form.Item name="price" label="价格（元）" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
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


