"use client";
import { Table, Button } from 'antd';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price: number; // cents
};

export default function ProductsClient({ products, locale }: { products: Product[]; locale: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>商品管理</h2>
        <Button type="primary">新增商品</Button>
      </div>
      <Table
        rowKey="id"
        dataSource={products}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: '金额(USD)', dataIndex: 'price', render: (v: number) => (v / 100).toFixed(2) },
          { title: '操作', key: 'actions', render: (_: any, r: Product) => <Link href={`/${locale}/products/${r.id}`}>前台查看</Link> },
        ]}
      />
    </div>
  );
}


