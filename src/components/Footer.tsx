"use client";
import { Row, Col, Divider, Space } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import FooterSection from './footer/FooterSection';
import NewsletterForm from './footer/NewsletterForm';
import './footer/Footer.css';

/**
 * 网站底部组件
 * 包含服务信息、支持信息、商店信息和邮件订阅功能
 */
export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="jade-footer">
      <div className="footer-content">
        <Row gutter={[32, 32]}>
          {/* 服务政策区域 */}
          <FooterSection title={t('service')}>
            <ul className="section-links">
              <li><a href="#" className="cursor-pointer">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="cursor-pointer">{t('shippingPolicy')}</a></li>
              <li><a href="#" className="cursor-pointer">{t('refundPolicy')}</a></li>
              <li><a href="#" className="cursor-pointer">{t('termsOfService')}</a></li>
            </ul>
          </FooterSection>
          
          {/* 客户支持区域 */}
          <FooterSection title={t('support')}>
            <div className="space-y-2">
              <p className="section-text">
                <PhoneOutlined />
                {t('phone')}
              </p>
            </div>
          </FooterSection>
          
          {/* 商店信息区域 */}
          <FooterSection title={t('store')}>
            <div className="space-y-2">
              <p className="section-text">
                <EnvironmentOutlined />
                {t('location')}
              </p>
              <p className="section-text">
                <ClockCircleOutlined />
                {t('hours')}
              </p>
            </div>
          </FooterSection>
          
          {/* 邮件订阅区域 */}
          <FooterSection title={t('newsletter')}>
            <p className="section-text mb-3">{t('newsletterDesc')}</p>
            <NewsletterForm />
          </FooterSection>
        </Row>
      </div>
      
      <Divider style={{ margin: '0' }} />
      
      {/* 版权信息 */}
      <div className="footer-bottom">
        <p>© Silk Road Jade {new Date().getFullYear()}. {t('copyright')}</p>
      </div>
    </footer>
  );
}


