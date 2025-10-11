"use client";
import { Card, Col, Row, Statistic, Table, Tag, Select, Space, Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';

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

  const columns: ColumnsType<RecentOrderRow> = [
    { title: '订单号', dataIndex: 'id', key: 'id', width: 220, ellipsis: true },
    { title: '用户邮箱', dataIndex: 'userEmail', key: 'userEmail', width: 220, ellipsis: true },
    { title: '金额', dataIndex: 'totalAmountCents', key: 'total', render: (v: number) => currency(v) },
    { title: '商品数', dataIndex: 'itemsCount', key: 'itemsCount', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (s: string) => tagForStatus(s) },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  ];

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
        <polyline fill="none" stroke="#1677ff" strokeWidth={2} points={pts} />
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
          <Card><Statistic title="商品数" value={metrics.productCount} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="分类数" value={metrics.categoryCount} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="今日订单" value={metrics.todayOrderCount} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="待处理订单" value={metrics.pendingOrderCount} /></Card>
        </Col>
        <Col xs={24}>
          <Card><Statistic title="今日收入" value={currency(metrics.todayRevenueCents)} /></Card>
        </Col>
      </Row>

      <Card title="收入趋势" bodyStyle={{ padding: 12 }}>
        {Timeline}
      </Card>

      <Card title="最近订单" bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={recentOrders}
          pagination={{ pageSize: 6, hideOnSinglePage: true }}
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


