"use client";
import { Table, Button, Space, Tag, Select, message, Input, DatePicker, Modal, Descriptions, Card, Image } from 'antd';
import { EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { apiGet, apiPatch } from '@/lib/apiClient';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

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

type OrderItem = {
  id: string;
  productId: string;
  productName?: string;
  price: number;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images?: { id: string; url: string; sortOrder: number }[];
  };
};

type Order = {
  id: string;
  orderNo: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  status: string;
  createdAt: string;
  paidAt?: string | null;
  shippingAddress?: any;
  user?: { 
    id: string;
    email?: string;
    name?: string;
  } | null;
  items?: OrderItem[];
};

// 订单状态标签
const getStatusTag = (status: string) => {
  const statusMap: Record<string, { color: string; text: string }> = {
    PENDING: { color: 'gold', text: '待支付' },
    PAID: { color: 'green', text: '已支付' },
    FAILED: { color: 'red', text: '失败' },
    SHIPPED: { color: 'blue', text: '已发货' },
    COMPLETED: { color: 'success', text: '已完成' },
    CANCELLED: { color: 'default', text: '已取消' },
  };
  const meta = statusMap[status] || { color: 'default', text: status };
  return <Tag color={meta.color}>{meta.text}</Tag>;
};

export default function OrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  // 查询条件
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  
  const isMobile = useIsMobile();

  // 同步父组件传入的订单数据
  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      console.log('[OrdersClient] 接收到订单数据:', initialOrders.length, '条');
      setOrders(initialOrders);
    } else if (initialOrders) {
      console.log('[OrdersClient] 接收到空订单列表');
      setOrders([]);
    }
  }, [initialOrders]);

  // 移动端简化列配置
  const mobileColumns: ColumnsType<Order> = useMemo(() => [
    {
      title: '订单信息',
      dataIndex: 'orderNo',
      key: 'info',
      render: (_, record) => (
        <div className="mobile-order-cell">
          <div className="mobile-order-id">{record.orderNo}</div>
          <div className="mobile-order-user">{record.user?.email || '未知用户'}</div>
        </div>
      )
    },
    {
      title: '金额/状态',
      dataIndex: 'totalCents',
      key: 'amount',
      width: 120,
      render: (_, record) => (
        <div className="mobile-order-amount">
          <div style={{ fontWeight: 600, color: '#3f8f4d' }}>
            ${(record.totalCents / 100).toFixed(2)}
          </div>
          <div style={{ marginTop: 4 }}>{getStatusTag(record.status)}</div>
        </div>
      )
    }
  ], []);

  // 桌面端完整列配置
  const desktopColumns: ColumnsType<Order> = useMemo(() => [
    { 
      title: '订单号', 
      dataIndex: 'orderNo',
      width: 200,
      ellipsis: true,
      render: (orderNo: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{orderNo}</span>
      )
    },
    { 
      title: '用户', 
      dataIndex: ['user', 'email'],
      width: 180,
      ellipsis: true,
      render: (email: string) => email || '未知用户'
    },
    { 
      title: '金额(USD)', 
      dataIndex: 'totalCents',
      width: 120,
      render: (v: number) => <span style={{ fontWeight: 600, color: '#3f8f4d' }}>${(v / 100).toFixed(2)}</span>
    },
    { 
      title: '状态', 
      dataIndex: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status)
    },
    { 
      title: '创建时间', 
      dataIndex: 'createdAt',
      width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space size={4}>
          <Button 
            size="small" 
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record)}
          >
            查看
          </Button>
          <Select
            size="small"
            value={record.status}
            style={{ width: 100 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            options={[
              { value: 'PENDING', label: '待支付' },
              { value: 'PAID', label: '已支付' },
              { value: 'SHIPPED', label: '已发货' },
              { value: 'DELIVERED', label: '已完成' },
              { value: 'CANCELLED', label: '已取消' },
            ]}
          />
        </Space>
      )
    }
  ], []);

  const columns = isMobile ? mobileColumns : desktopColumns;

  // 查询订单
  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchOrderNo) params.append('orderNo', searchOrderNo);
      if (searchStatus !== 'ALL') params.append('status', searchStatus);
      if (dateRange && dateRange[0]) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
      }
      if (dateRange && dateRange[1]) {
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
      }
      
      const result = await apiGet(`/api/admin/orders?${params.toString()}`);
      if (result.success && result.data) {
        setOrders(result.data);
        message.success(`查询成功，找到 ${result.data.length} 条订单`);
      }
    } catch (error) {
      message.error('查询失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置查询
  const handleReset = async () => {
    setSearchOrderNo('');
    setSearchStatus('ALL');
    setDateRange(null);
    setLoading(true);
    try {
      const result = await apiGet('/api/admin/orders');
      if (result.success && result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 显示订单详情
  const showOrderDetail = (order: Order) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  // 更新订单状态
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const result = await apiPatch('/api/admin/orders', { id: orderId, status: newStatus });
      if (result.success) {
        message.success('状态更新成功');
        // 更新本地数据
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  // 批量更新状态
  const onBulkUpdateStatus = async (status: string) => {
    if (!selectedRowKeys.length) return message.info('请选择要更新的订单');
    try {
      await Promise.all(
        selectedRowKeys.map(id => apiPatch('/api/admin/orders', { id, status }))
      );
      message.success('批量更新成功');
      setSelectedRowKeys([]);
      handleReset();
    } catch (error) {
      message.error('批量更新失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>订单管理</h2>
      </div>

      {/* 查询表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap style={{ width: '100%' }}>
            <Input
              placeholder="订单号"
              value={searchOrderNo}
              onChange={(e) => setSearchOrderNo(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              value={searchStatus}
              onChange={setSearchStatus}
              style={{ width: 120 }}
              options={[
                { value: 'ALL', label: '全部状态' },
                { value: 'PENDING', label: '待支付' },
                { value: 'PAID', label: '已支付' },
                { value: 'SHIPPED', label: '已发货' },
                { value: 'DELIVERED', label: '已完成' },
                { value: 'CANCELLED', label: '已取消' },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['开始日期', '结束日期']}
              style={{ width: 260 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              查询
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
          </Space>
        </Space>
      </Card>

      {!isMobile && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : '批量操作：'}
          </span>
          <Space>
            <Button 
              onClick={() => onBulkUpdateStatus('SHIPPED')}
              disabled={selectedRowKeys.length === 0}
            >
              标记为已发货
            </Button>
            <Button 
              onClick={() => onBulkUpdateStatus('DELIVERED')}
              disabled={selectedRowKeys.length === 0}
            >
              标记为已完成
            </Button>
          </Space>
        </div>
      )}

      <Table
        rowKey="id"
        dataSource={orders}
        columns={columns}
        rowSelection={isMobile ? undefined : {
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          simple: isMobile,
          size: isMobile ? 'small' : 'default',
          showTotal: (total) => `共 ${total} 条订单`,
        }}
        scroll={isMobile ? { x: 'max-content' } : { x: 1200 }}
        size={isMobile ? 'small' : 'middle'}
        loading={loading}
      />

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentOrder && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="订单号" span={2}>
                <span style={{ fontFamily: 'monospace' }}>{currentOrder.orderNo}</span>
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {getStatusTag(currentOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(currentOrder.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              {currentOrder.paidAt && (
                <Descriptions.Item label="支付时间" span={2}>
                  {new Date(currentOrder.paidAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="用户邮箱" span={2}>
                {currentOrder.user?.email || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="商品小计">
                ${(currentOrder.subtotalCents / 100).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="运费">
                {currentOrder.shippingCents === 0 ? '免运费' : `$${(currentOrder.shippingCents / 100).toFixed(2)}`}
              </Descriptions.Item>
              <Descriptions.Item label="订单总额" span={2}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#d4380d' }}>
                  ${(currentOrder.totalCents / 100).toFixed(2)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {/* 商品列表 */}
            <h4 style={{ marginTop: 24, marginBottom: 12 }}>商品清单</h4>
            {currentOrder.items && currentOrder.items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentOrder.items.map((item, index) => {
                  // 获取第一张图片
                  const firstImage = item.product?.images && item.product.images.length > 0 
                    ? item.product.images[0].url 
                    : null;
                  
                  return (
                    <Card key={index} size="small">
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        {firstImage && (
                          <Image
                            src={firstImage}
                            alt={item.product?.name || item.productName || '商品'}
                            width={80}
                            height={80}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            {item.product?.name || item.productName || '未知商品'}
                          </div>
                          <div style={{ color: '#666', fontSize: '13px' }}>
                            单价：${(item.price / 100).toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, color: '#3f8f4d' }}>
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                暂无商品信息
              </div>
            )}

            {/* 收货地址 */}
            {currentOrder.shippingAddress && (
              <>
                <h4 style={{ marginTop: 24, marginBottom: 12 }}>收货地址</h4>
                <Card size="small">
                  <div style={{ lineHeight: 1.8 }}>
                    <div><strong>收货人：</strong>{currentOrder.shippingAddress.fullName}</div>
                    <div><strong>电话：</strong>{currentOrder.shippingAddress.phone}</div>
                    {currentOrder.shippingAddress.email && (
                      <div><strong>邮箱：</strong>{currentOrder.shippingAddress.email}</div>
                    )}
                    <div>
                      <strong>地址：</strong>
                      {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.city}
                      {currentOrder.shippingAddress.district && ` ${currentOrder.shippingAddress.district}`}
                      {' '}
                      {currentOrder.shippingAddress.addressLine1}
                      {currentOrder.shippingAddress.addressLine2 && ` ${currentOrder.shippingAddress.addressLine2}`}
                    </div>
                    <div><strong>邮编：</strong>{currentOrder.shippingAddress.postalCode}</div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}


