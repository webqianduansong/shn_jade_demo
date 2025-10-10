"use client";
import { Table, Button } from 'antd';

type Category = { id: string; name: string; slug: string };

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>分类管理</h2>
        <Button type="primary">新增分类</Button>
      </div>
      <Table rowKey="id" dataSource={categories} columns={[{ title: '名称', dataIndex: 'name' }, { title: 'Slug', dataIndex: 'slug' }]} />
    </div>
  );
}


