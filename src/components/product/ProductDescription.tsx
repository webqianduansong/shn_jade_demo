"use client";
import { Card, Space, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

/**
 * 产品描述组件
 * 展示产品的详细描述和规格信息
 */
interface ProductDescriptionProps {
  product: {
    name: string;
    nameEn: string;
  };
  locale: string;
}

export default function ProductDescription({ product, locale }: ProductDescriptionProps) {
  return (
    <Row gutter={[32, 32]}>
      {/* 描述部分 */}
      <Col xs={24} lg={12}>
        <Card title={locale === 'zh' ? '商品描述' : 'Description'}>
          <Space direction="vertical" size="middle" className="w-full">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <CheckCircleOutlined className="text-green-600 mr-2" />
                {locale === 'zh' 
                  ? '这款耳环采用矩形翡翠，散发出鲜艳、半透明的绿色光泽，无论走到哪里都能轻松吸引目光。' 
                  : 'The earrings feature rectangular jadeite stones that radiate a vivid, translucent green hue, effortlessly catching the light and turning heads wherever you go.'
                }
              </p>
              <p>
                {locale === 'zh' 
                  ? '作为一件真正的艺术品，这些耳环展示了卓越的工艺和创新的设计，融合了永恒的优雅和现代的精致。' 
                  : 'A true work of art, these earrings showcase exceptional craftsmanship and innovative design, blending timeless elegance with modern sophistication.'
                }
              </p>
            </div>
          </Space>
        </Card>
      </Col>
      
      {/* 规格部分 */}
      <Col xs={24} lg={12}>
        <Card title={locale === 'zh' ? '产品规格' : 'Product Specifications'}>
          <Row gutter={[16, 16]}>
            <Col xs={12}>
              <Card size="small" className="text-center">
                <Space direction="vertical" size="small" className="w-full">
                  <CheckCircleOutlined className="text-green-600 text-2xl" />
                  <span className="text-sm font-medium">{locale === 'zh' ? '免费配送' : 'Free shipping'}</span>
                </Space>
              </Card>
            </Col>
            <Col xs={12}>
              <Card size="small" className="text-center">
                <Space direction="vertical" size="small" className="w-full">
                  <CheckCircleOutlined className="text-blue-600 text-2xl" />
                  <span className="text-sm font-medium">{locale === 'zh' ? '30天免费退货' : 'Free 30-Day Returns'}</span>
                </Space>
              </Card>
            </Col>
            <Col xs={12}>
              <Card size="small" className="text-center">
                <Space direction="vertical" size="small" className="w-full">
                  <CheckCircleOutlined className="text-purple-600 text-2xl" />
                  <span className="text-sm font-medium">{locale === 'zh' ? '2年保修' : '2-Year Warranty'}</span>
                </Space>
              </Card>
            </Col>
            <Col xs={12}>
              <Card size="small" className="text-center">
                <Space direction="vertical" size="small" className="w-full">
                  <CheckCircleOutlined className="text-orange-600 text-2xl" />
                  <span className="text-sm font-medium">{locale === 'zh' ? '香港手工制作' : 'Handmade in HongKong'}</span>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
