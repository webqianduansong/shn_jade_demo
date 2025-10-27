"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { resolveSrc } from '@/lib/imageUtils';
import { useNotification } from '../Notification';
import './CategoryPageClient.css';
import { 
  Row, 
  Col, 
  Card, 
  Select, 
  Typography, 
  Space, 
  Button, 
  Empty,
  Spin,
  Image,
  Rate,
  Tooltip
} from 'antd';
import { 
  AppstoreOutlined,
  UnorderedListOutlined,
  DownOutlined,
  ShoppingCartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import './index.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

type UiProduct = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  image: unknown;
  price: number;
};

interface CategoryPageClientProps {
  products: UiProduct[];
  locale: string;
}

export default function CategoryPageClient({ products, locale }: CategoryPageClientProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const t = useTranslations('products');

  useEffect(() => {
    setMounted(true);
  }, []);

  // 排序产品
  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    // 排序
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popular':
      default:
        break;
    }

    return sorted;
  }, [products, sortBy]);

  const sortOptions = [
    { value: 'popular', label: locale === 'zh' ? '最受欢迎' : 'Best selling' },
    { value: 'price-low', label: locale === 'zh' ? '价格：从低到高' : 'Price: Low to High' },
    { value: 'price-high', label: locale === 'zh' ? '价格：从高到低' : 'Price: High to Low' },
    { value: 'newest', label: locale === 'zh' ? '最新优先' : 'Newest First' },
  ];

  // 跳转到产品详情页
  const handleProductClick = (productId: string) => {
    router.push(`/${locale}/products/${productId}`);
  };

  // 处理添加到购物车
  const handleAddToCart = async (productId: string, productName: string, productNameEn: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (addingToCart === productId) return;
    
    setAddingToCart(productId);
    try {
      // 登录检查
      const me = await fetch('/api/auth/me');
      if (!me.ok) {
        window.location.href = `/${locale}/login?redirect=/${locale}/products/${productId}`;
        return;
      }
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({productId, quantity: 1}),
      });
      
      if (response.ok) {
        showNotification(
          locale === 'zh' 
            ? `已将 ${productName} 添加到购物车！` 
            : `Added ${productNameEn} to cart!`,
          'success'
        );
      } else {
        showNotification(
          locale === 'zh' 
            ? '添加失败，请重试' 
            : 'Failed to add to cart, please try again',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showNotification(
        locale === 'zh' 
          ? '网络错误，请重试' 
          : 'Network error, please try again',
        'error'
      );
    } finally {
      setTimeout(() => setAddingToCart(null), 1000);
    }
  };


  return (
    <div>
      {/* Header Section */}
      <div className="category-page-header" style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #f0f0f0', 
        marginBottom: '24px',
        padding: '16px 24px'
      }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text strong style={{ fontSize: '16px', color: '#262626' }}>
              {sortedProducts.length} {locale === 'zh' ? '件商品' : 'products'}
            </Text>
          </Col>
          
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            <Space size="middle" wrap>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 150 }}
                suffixIcon={<DownOutlined />}
                bordered={false}
              >
                {sortOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              
              <Space size="small" className="view-mode-toggle">
                <Tooltip title={locale === 'zh' ? '网格视图' : 'Grid View'}>
                  <Button
                    type={viewMode === 'grid' ? 'primary' : 'text'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setViewMode('grid')}
                    style={{ 
                      border: 'none',
                      boxShadow: 'none'
                    }}
                  />
                </Tooltip>
                <Tooltip title={locale === 'zh' ? '列表视图' : 'List View'}>
                  <Button
                    type={viewMode === 'list' ? 'primary' : 'text'}
                    icon={<UnorderedListOutlined />}
                    onClick={() => setViewMode('list')}
                    style={{ 
                      border: 'none',
                      boxShadow: 'none'
                    }}
                  />
                </Tooltip>
              </Space>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Products Display */}
      <div style={{padding: '24px'}}>
        {sortedProducts.length > 0 ? (
          <Spin spinning={loading}>
            {viewMode === 'grid' ? (
              <Row gutter={[16, 16]}>
                {sortedProducts.map((product) => (
                  <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                    <Card
                      className="category-page-product-card"
                      hoverable
                      style={{ 
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}
                      onClick={() => handleProductClick(product.id)}
                      cover={
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={resolveSrc(product.image)}
                            alt={locale === 'zh' ? product.name : product.nameEn}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            className="category-page-product-image"
                            preview={false}
                          />
                        </div>
                      }
                      actions={[
                        <Button 
                          key="cart"
                          type="primary" 
                          icon={<ShoppingCartOutlined />}
                          onClick={(e) => handleAddToCart(product.id, product.name, product.nameEn, e)}
                          loading={addingToCart === product.id}
                          size="small"
                        >
                          {locale === 'zh' ? '加入购物车' : 'Add to Cart'}
                        </Button>,
                        <Button 
                          key="view"
                          type="text" 
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.id);
                          }}
                          size="small"
                        >
                          {locale === 'zh' ? '详情' : 'Details'}
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div className="category-page-product-title">
                            {locale === 'zh' ? product.name : product.nameEn}
                          </div>
                        }
                        description={
                          <div className="space-y-2">
                            <p className="category-page-product-description">
                              {locale === 'zh' ? product.description : product.descriptionEn}
                            </p>
                            <div className="category-page-product-price-container">
                              <div className="shop_Card_Price">
                                ${product.price}
                              </div>
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              /* 列表视图 */
              <div className='list_View' >
                {sortedProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="category-page-product-card"
                    hoverable
                    style={{ 
                      cursor: 'pointer',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0',
                      marginBottom: '8px'
                    }}
                    onClick={() => handleProductClick(product.id)}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <Row gutter={[16, 0]} align="middle">
                      {/* 商品图片 */}
                      <Col xs={24} sm={4} md={3}>
                        <div className="relative w-12 h-12 overflow-hidden rounded-md">
                          <Image
                            src={resolveSrc(product.image)}
                            alt={locale === 'zh' ? product.name : product.nameEn}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            className="category-page-product-image"
                            preview={false}
                          />
                        </div>
                      </Col>
                      
                      {/* 商品信息 */}
                      <Col xs={24} sm={16} md={15}>
                        <div className="space-y-3">
                          {/* 商品标题 - 高亮显示 */}
                          <div className="text-lg font-bold text-gray-900 line-clamp-1">
                            {locale === 'zh' ? product.name : product.nameEn}
                          </div>
                          
                          {/* 商品描述 */}
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {locale === 'zh' ? product.description : product.descriptionEn}
                          </p>
                          
                          {/* 价格 - 高亮显示 */}
                          <div className="flex items-center justify-between">
                            <div className="shop_Card_Price">
                              ${product.price}
                            </div>
                          </div>
                        </div>
                      </Col>
                      
                      {/* 操作按钮区域 */}
                      <Col xs={24} sm={4} md={6}>
                        <div className="flex flex-col gap-3">
                          <Button 
                            type="primary" 
                            icon={<ShoppingCartOutlined />}
                            onClick={(e) => handleAddToCart(product.id, product.name, product.nameEn, e)}
                            loading={addingToCart === product.id}
                            size="small"
                            style={{
                              backgroundColor: '#10b981',
                              borderColor: '#10b981',
                              fontWeight: 'bold',
                              fontSize: '11px',
                              height: '28px',
                              width: '100%'
                            }}
                          >
                            {locale === 'zh' ? '加入购物车' : 'Add to Cart'}
                          </Button>
                          <Button 
                            type="text" 
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product.id);
                            }}
                            size="small"
                            style={{
                              color: '#666',
                              fontWeight: '500',
                              fontSize: '11px',
                              height: '28px',
                              width: '100%'
                            }}
                          >
                            {locale === 'zh' ? '详情' : 'Details'}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            )}
          </Spin>
        ) : (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Title level={3} style={{ color: '#8c8c8c', marginBottom: '16px' }}>
                    {locale === 'zh' ? '暂无商品' : 'No Products Found'}
                  </Title>
                  <Paragraph style={{ color: '#bfbfbf', marginBottom: '24px' }}>
                    {locale === 'zh' 
                      ? '该分类下暂时没有商品，请尝试其他分类或返回首页浏览'
                      : 'No products found in this category. Try browsing other categories or return to homepage.'
                    }
                  </Paragraph>
                  <Button 
                    type="primary" 
                    size="large"
                    href={`/${locale}`}
                  >
                    {locale === 'zh' ? '返回首页' : 'Back to Home'}
                  </Button>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
