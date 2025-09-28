"use client";
import { useTranslations } from 'next-intl';

/**
 * 特色功能展示组件
 * 展示网站的主要特色和服务优势
 */
export default function FeaturesSection() {
  const t = useTranslations('features'); // 特色功能相关翻译

  return (
    <section className="features-section">
      <div className="container">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3 className="feature-title">{t('typeA')}</h3>
            <p className="feature-description">{t('typeADesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3 className="feature-title">{t('shipping')}</h3>
            <p className="feature-description">{t('shippingDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3 className="feature-title">{t('warranty')}</h3>
            <p className="feature-description">{t('warrantyDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
