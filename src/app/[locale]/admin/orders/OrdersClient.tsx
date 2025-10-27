"use client";
import { Table, Button, Space, Tag, Select, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
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

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: { email?: string } | null;
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

export default function OrdersClient({ orders }: { orders: Order[] }) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const isMobile = useIsMobile();

  // 移动端简化列配置
  const mobileColumns: ColumnsType<Order> = useMemo(() => [
    {
      title: '订单信息',
      dataIndex: 'id',
      key: 'info',
      render: (_, record) => (
        <div className="mobile-order-cell">
          <div className="mobile-order-id">{record.id.slice(0, 12)}...</div>
          <div className="mobile-order-user">{record.user?.email || '未知用户'}</div>
        </div>
      )
    },
    {
      title: '金额/状态',
      dataIndex: 'totalAmount',
      key: 'amount',
      width: 120,
      render: (_, record) => (
        <div className="mobile-order-amount">
          <div style={{ fontWeight: 600, color: '#3f8f4d' }}>
            ¥{(record.totalAmount / 100).toFixed(2)}
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
      dataIndex: 'id',
      width: 220,
      ellipsis: true
    },
    { 
      title: '用户', 
      dataIndex: ['user', 'email'],
      width: 200,
      ellipsis: true,
      render: (email: string) => email || '未知用户'
    },
    { 
      title: '金额(CNY)', 
      dataIndex: 'totalAmount',
      width: 120,
      render: (v: number) => `¥${(v / 100).toFixed(2)}`
    },
    { 
      title: '状态', 
      dataIndex: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status)
    },
    { 
      title: '创建时间', 
      dataIndex: 'createdAt',
      width: 180,
      render: (v: string) => new Date(v).toLocaleString('zh-CN')
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
            icon={<EyeOutlined />}
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
              { value: 'COMPLETED', label: '已完成' },
              { value: 'CANCELLED', label: '已取消' },
            ]}
          />
        </Space>
      )
    }
  ], []);

  const columns = isMobile ? mobileColumns : desktopColumns;

  // 更新订单状态
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    message.success('状态更新成功');
    // TODO: 实现状态更新逻辑
  };

  // 批量更新状态
  const onBulkUpdateStatus = async (status: string) => {
    if (!selectedRowKeys.length) return message.info('请选择要更新的订单');
    message.success('批量更新成功');
    setSelectedRowKeys([]);
    // TODO: 实现批量更新逻辑
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>订单管理</h2>
      </div>

      {!isMobile && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : '批量操作：'}
          </span>
          <Space>
            <Button 
              className="jade-btn-outline"
              onClick={() => onBulkUpdateStatus('SHIPPED')}
              disabled={selectedRowKeys.length === 0}
            >
              标记为已发货
            </Button>
            <Button 
              className="jade-btn-outline"
              onClick={() => onBulkUpdateStatus('COMPLETED')}
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
          size: isMobile ? 'small' : 'default'
        }}
        scroll={isMobile ? { x: 'max-content' } : { x: 1200 }}
        size={isMobile ? 'small' : 'middle'}
      />
    </div>
  );
}


