"use client";
import { Card, Col, Row, Statistic, Table, Tag, Select, Space, Button } from 'antd';
import { ShopOutlined, AppstoreOutlined, ShoppingOutlined, ClockCircleOutlined, DollarOutlined, LineChartOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import './dashboard.css';

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

export interface DashboardMetrics {
  productCount: number;
  categoryCount: number;
  pendingOrderCount: number;
  todayOrderCount: number;
  todayRevenueCents: number;
}

export interface RecentOrderRow {
  id: string;
  userEmail: string;
  totalAmountCents: number;
  status: string;
  itemsCount: number;
  createdAt: string;
}

export default function DashboardClient({ metrics, recentOrders, locale = 'zh' }: { metrics: DashboardMetrics; recentOrders: RecentOrderRow[]; locale?: string }) {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<{ date: string; orderCount: number; revenueCents: number }[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/dashboard?days=${days}`);
        const data = await res.json();
        setSeries(data.revenueSeries || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [days]);
  const currency = (cents: number) => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 }).format((cents || 0) / 100);

  // 移动端简化列配置
  const mobileColumns: ColumnsType<RecentOrderRow> = [
    { 
      title: '订单信息', 
      dataIndex: 'id', 
      key: 'id',
      width: 200,
      ellipsis: true,
      render: (id: string, record: RecentOrderRow) => (
        <div className="mobile-order-cell">
          <div className="mobile-order-id">{id.slice(0, 12)}...</div>
          <div className="mobile-order-email">{record.userEmail}</div>
        </div>
      )
    },
    { 
      title: '金额/状态', 
      dataIndex: 'totalAmountCents', 
      key: 'total',
      width: 120,
      render: (v: number, record: RecentOrderRow) => (
        <div className="mobile-order-amount">
          <div style={{ fontWeight: 600, color: '#2d5a3d' }}>{currency(v)}</div>
          <div style={{ marginTop: 4 }}>{tagForStatus(record.status)}</div>
        </div>
      )
    },
  ];

  // 桌面端完整列配置
  const desktopColumns: ColumnsType<RecentOrderRow> = [
    { title: '订单号', dataIndex: 'id', key: 'id', width: 220, ellipsis: true },
    { title: '用户邮箱', dataIndex: 'userEmail', key: 'userEmail', width: 220, ellipsis: true },
    { title: '金额', dataIndex: 'totalAmountCents', key: 'total', width: 120, render: (v: number) => currency(v) },
    { title: '商品数', dataIndex: 'itemsCount', key: 'itemsCount', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (s: string) => tagForStatus(s) },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  ];

  const columns = isMobile ? mobileColumns : desktopColumns;

  const Timeline = useMemo(() => {
    // 简易收入折线：使用原生 SVG，避免额外依赖
    if (!series.length) return null;
    const width = 800;
    const height = 160;
    const pad = 24;
    const maxY = Math.max(...series.map((s) => s.revenueCents), 1);
    const pts = series.map((s, i) => {
      const x = pad + (i * (width - pad * 2)) / Math.max(1, series.length - 1);
      const y = height - pad - (s.revenueCents / maxY) * (height - pad * 2);
      return `${x},${y}`;
    }).join(' ');
    const gridY = Array.from({ length: 4 }).map((_, i) => {
      const y = pad + (i * (height - pad * 2)) / 3;
      return <line key={i} x1={pad} x2={width - pad} y1={y} y2={y} stroke="#f0f0f0"/>;
    });
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {gridY}
        <polyline fill="none" stroke="#2d5a3d" strokeWidth={3} points={pts} />
        {series.map((s, i) => {
          const x = pad + (i * (width - pad * 2)) / Math.max(1, series.length - 1);
          const y = height - pad - (s.revenueCents / maxY) * (height - pad * 2);
          return <circle key={i} cx={x} cy={y} r={4} fill="#4a8c5f" stroke="#fff" strokeWidth={2} />;
        })}
      </svg>
    );
  }, [series]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div />
        <Space>
          <span>时间范围</span>
          <Select
            value={days}
            onChange={setDays}
            options={[{ value: 7, label: '近7天' }, { value: 30, label: '近30天' }]}
            style={{ width: 120 }}
          />
          <Button loading={loading} onClick={() => setDays((d) => d)}>
            刷新
          </Button>
        </Space>
      </Space>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="stat-card stat-card-product" bordered={false}>
            <Statistic 
              title="商品数" 
              value={metrics.productCount} 
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#2d5a3d' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card stat-card-category" bordered={false}>
            <Statistic 
              title="分类数" 
              value={metrics.categoryCount}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#4a8c5f' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card stat-card-order" bordered={false}>
            <Statistic 
              title="今日订单" 
              value={metrics.todayOrderCount}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="stat-card stat-card-pending" bordered={false}>
            <Statistic 
              title="待处理订单" 
              value={metrics.pendingOrderCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24}>
          <Card className="stat-card stat-card-revenue" bordered={false}>
            <Statistic 
              title="今日收入" 
              value={currency(metrics.todayRevenueCents)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '32px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <span>
            <LineChartOutlined style={{ marginRight: 8 }} />
            收入趋势
          </span>
        }
        className="chart-card"
        bordered={false}
        bodyStyle={{ padding: 12 }}
      >
        {Timeline}
      </Card>

      <Card 
        title={
          <span>
            <ShoppingOutlined style={{ marginRight: 8 }} />
            最近订单
          </span>
        }
        className="table-card"
        bordered={false}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={recentOrders}
          pagination={{ 
            pageSize: isMobile ? 5 : 6, 
            hideOnSinglePage: true,
            simple: isMobile,
            size: isMobile ? 'small' : 'default'
          }}
          scroll={isMobile ? { x: 'max-content' } : undefined}
          size={isMobile ? 'small' : 'middle'}
        />
      </Card>
    </div>
  );
}

function tagForStatus(status: string) {
  const map: Record<string, { color: string; text: string }> = {
    PENDING: { color: 'gold', text: '待支付' },
    PAID: { color: 'green', text: '已支付' },
    FAILED: { color: 'red', text: '失败' },
    SHIPPED: { color: 'blue', text: '已发货' },
  };
  const meta = map[status] || { color: 'default', text: status };
  return <Tag color={meta.color}>{meta.text}</Tag>;
}


