"use client";
import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Tag,
  Popconfirm,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/apiClient';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    addresses: number;
  };
}

interface UsersClientProps {
  initialUsers: User[];
  initialTotal: number;
}

export default function UsersClient({ initialUsers, initialTotal }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 同步初始数据
  useEffect(() => {
    setUsers(initialUsers);
    setTotal(initialTotal);
  }, [initialUsers, initialTotal]);

  // 加载用户列表
  const loadUsers = async (currentPage = page, resetPage = false) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        page: resetPage ? '1' : String(currentPage),
        pageSize: String(pageSize),
      });
      if (searchEmail) params.append('email', searchEmail);
      if (searchName) params.append('name', searchName);

      const result = await apiGet(`/api/admin/users?${params.toString()}`, {
        showError: true,
      });

      if (result.success) {
        setUsers(result.data.users);
        setTotal(result.data.total);
        if (resetPage) setPage(1);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    loadUsers(1, true);
  };

  // 重置
  const handleReset = () => {
    setSearchEmail('');
    setSearchName('');
    setPage(1);
    loadUsers(1, true);
  };

  // 打开添加/编辑模态框
  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        email: user.email,
        name: user.name || '',
        password: '',
      });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // 保存用户
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingUser) {
        // 编辑用户
        const result = await apiPatch('/api/admin/users', {
          id: editingUser.id,
          ...values,
        }, {
          showError: true,
          showSuccess: true,
          successMessage: '用户更新成功',
        });

        if (result.success) {
          closeModal();
          loadUsers();
        }
      } else {
        // 添加用户
        const result = await apiPost('/api/admin/users', values, {
          showError: true,
          showSuccess: true,
          successMessage: '用户创建成功',
        });

        if (result.success) {
          closeModal();
          loadUsers();
        }
      }
    } catch (error) {
      console.error('保存用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const result = await apiDelete(`/api/admin/users?id=${id}`, {
        showError: true,
        showSuccess: true,
        successMessage: '用户删除成功',
      });

      if (result.success) {
        loadUsers();
      }
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
      render: (id: string) => (
        <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {id.substring(0, 8)}...
        </span>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string | null) => name || <span style={{ color: '#999' }}>未设置</span>,
    },
    {
      title: '订单数',
      key: 'orders',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color={record._count.orders > 0 ? 'blue' : 'default'}>
          <ShoppingOutlined /> {record._count.orders}
        </Tag>
      ),
    },
    {
      title: '地址数',
      key: 'addresses',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color={record._count.addresses > 0 ? 'green' : 'default'}>
          <EnvironmentOutlined /> {record._count.addresses}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={
              record._count.orders > 0
                ? '该用户有订单记录，无法删除'
                : '确定要删除此用户吗？'
            }
            disabled={record._count.orders > 0}
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={record._count.orders > 0}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>用户管理</Title>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="本页用户"
              value={users.length}
              suffix={`/ ${pageSize}`}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索和操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索邮箱"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Input
            placeholder="搜索姓名"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={searchLoading}
          >
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            添加用户
          </Button>
        </Space>
      </Card>

      {/* 用户列表表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={searchLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
              loadUsers(newPage);
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={closeModal}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              placeholder="user@example.com"
              disabled={!!editingUser}
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { min: 2, message: '姓名至少 2 个字符' },
              { max: 50, message: '姓名最多 50 个字符' },
            ]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? '新密码（留空则不修改）' : '密码'}
            rules={
              editingUser
                ? [
                    {
                      min: 8,
                      message: '密码至少 8 位',
                    },
                    {
                      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                      message: '密码必须包含字母和数字',
                    },
                  ]
                : [
                    { required: true, message: '请输入密码' },
                    { min: 8, message: '密码至少 8 位' },
                    {
                      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                      message: '密码必须包含字母和数字',
                    },
                  ]
            }
          >
            <Input.Password placeholder="至少 8 位，包含字母和数字" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

