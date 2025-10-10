"use client";
import { Table } from 'antd';

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: { email?: string } | null;
};

export default function OrdersClient({ orders }: { orders: Order[] }) {
  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>订单管理</h2>
      <Table
        rowKey="id"
        dataSource={orders}
        columns={[
          { title: '订单号', dataIndex: 'id' },
          { title: '用户', dataIndex: ['user', 'email'] as any },
          { title: '金额(USD)', dataIndex: 'totalAmount', render: (v: number) => (v / 100).toFixed(2) },
          { title: '状态', dataIndex: 'status' },
          { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => new Date(v).toLocaleString() },
        ]}
      />
    </div>
  );
}


