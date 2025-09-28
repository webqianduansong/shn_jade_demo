"use client";
import { Button, Space, Divider, Typography } from 'antd';
import { ShoppingCartOutlined, ShareAltOutlined, CheckOutlined, FacebookOutlined, PinterestOutlined } from '@ant-design/icons';
import './ProductDetailClient.css';

const { Text, Title } = Typography;

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    nameEn: string;
    price: number;
  };
  locale: string;
}

export default function ProductDetailClient({ product, locale }: ProductDetailClientProps) {
  return (
    <div className="space-y-4">
      {/* 产品标题 */}
      <div className="mb-3">
        <Title level={2} className="product-detail-title">
          {locale === 'zh' ? product.name : product.nameEn}
        </Title>
        <Text type="secondary" className="product-detail-text">
          {locale === 'zh' ? '无评价' : 'No reviews'}
        </Text>
      </div>

      {/* 折扣横幅 */}
      <div className="product-detail-discount">
        {locale === 'zh' ? '20% 玉石珠宝折扣' : '20% OFF Jade Jewelry at Checkout'}
      </div>

      {/* 价格区域 */}
      <div className="mb-3">
        <Title level={1} className="product-detail-price">
          ${product.price.toFixed(2)} USD
        </Title>
      </div>

      {/* 数量选择 */}
      <div className="mb-4">
        <Text strong className="product-detail-quantity-label">
          {locale === 'zh' ? '数量' : 'Quantity'}
        </Text>
        <div className="product-detail-quantity-controls">
          <Button 
            type="text" 
            className="product-detail-quantity-button"
            onClick={() => {/* 减少数量逻辑 */}}
          >
            -
          </Button>
          <div className="product-detail-quantity-display">
            1
          </div>
          <Button 
            type="text" 
            className="product-detail-quantity-button-right"
            onClick={() => {/* 增加数量逻辑 */}}
          >
            +
          </Button>
        </div>
      </div>

      {/* 操作按钮 */}
      <Space direction="vertical" size="small" className="product-detail-actions">
        <Button 
          size="large" 
          className="product-detail-cart-button"
        >
          {locale === 'zh' ? '加入购物车' : 'ADD TO CART'}
        </Button>
        
        <Button 
          type="primary" 
          size="large" 
          className="product-detail-buy-button"
        >
          {locale === 'zh' ? '立即购买' : 'Buy with shop'}
        </Button>
        
        <div className="product-detail-more-payment">
          <Button type="link" size="small" className="product-detail-more-payment-button">
            {locale === 'zh' ? '更多支付方式' : 'More payment options'}
          </Button>
        </div>
      </Space>

      {/* 取货信息 */}
      <div className="product-detail-pickup">
        <div className="product-detail-pickup-content">
          <CheckOutlined className="product-detail-pickup-icon" />
          <div className="space-y-1">
            <Text className="product-detail-pickup-text">
              {locale === 'zh' ? '可在香港中环皇后大道中33号取货' : 'Pickup available at Melbourne Plaza, 33 Queen\'s Road Central'}
            </Text>
            <Text type="secondary" className="product-detail-pickup-subtext">
              {locale === 'zh' ? '通常2-4天内准备就绪' : 'Usually ready in 2-4 days'}
            </Text>
            <Button type="link" size="small" className="product-detail-pickup-link">
              {locale === 'zh' ? '查看店铺信息' : 'View store information'}
            </Button>
          </div>
        </div>
      </div>

      {/* 分享选项 */}
      <div className="mb-4">
        <Space size="small" className="product-detail-social">
          <Button type="text" icon={<FacebookOutlined />} size="small" className="product-detail-social-button" />
          <Button type="text" icon={<PinterestOutlined />} size="small" className="product-detail-social-button" />
        </Space>
      </div>

      <Divider className="my-4" />

      {/* 产品描述 */}
      <div>
        <Title level={4} className="product-detail-description-title">
          {locale === 'zh' ? '产品描述' : 'Description'}
        </Title>
        <Text className="product-detail-description-text">
          {locale === 'zh' 
            ? '这些帝王绿翡翠钻石圆盘耳钉是任何珠宝收藏的奢华补充。采用10毫米天然翡翠圆盘配以真钻，这些耳钉散发着优雅和精致。精心镶嵌在18K白金中，配有坚固的耳钉背托，每件作品都由技艺精湛的工匠精心手工制作。'
            : 'These Imperial Green Jadeite & Diamond Round Disc Stud Earrings are a luxurious addition to any jewelry collection. Featuring a vibrant 10mm natural jadeite disc paired with genuine diamonds, these earrings exude elegance and sophistication.'
          }
        </Text>
      </div>
    </div>
  );
}
