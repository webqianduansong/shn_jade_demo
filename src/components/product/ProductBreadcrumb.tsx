"use client";
import { Breadcrumb, Space, Button, Row, Col } from 'antd';
import { 
  HomeOutlined, 
  ShopOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

/**
 * 产品页面面包屑导航组件
 * 提供产品页面的导航路径和前后切换功能
 */
interface ProductBreadcrumbProps {
  productName: string;
  productNameEn: string;
  locale: string;
}

export default function ProductBreadcrumb({ 
  productName, 
  productNameEn, 
  locale 
}: ProductBreadcrumbProps) {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Row justify="space-between" align="middle">
          <Col>
            <Breadcrumb
              items={[
                {
                  href: `/${locale}`,
                  title: (
                    <Space>
                      <HomeOutlined />
                      <span>{locale === 'zh' ? '首页' : 'Home'}</span>
                    </Space>
                  ),
                },
                {
                  href: `/${locale}/#products`,
                  title: (
                    <Space>
                      <ShopOutlined />
                      <span>{locale === 'zh' ? '商品' : 'Products'}</span>
                    </Space>
                  ),
                },
                {
                  title: locale === 'zh' ? productName : productNameEn,
                },
              ]}
            />
          </Col>
          <Col>
            <Space>
              <Button 
                type="text" 
                icon={<LeftOutlined />}
                size="small"
              >
                {locale === 'zh' ? '上一个' : 'Previous'}
              </Button>
              <Button 
                type="text" 
                icon={<RightOutlined />}
                size="small"
              >
                {locale === 'zh' ? '下一个' : 'Next'}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
}
