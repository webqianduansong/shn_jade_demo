"use client";
import { Col } from 'antd';
import { useTranslations } from 'next-intl';

/**
 * Footer区域组件
 * 用于显示Footer中的各个信息区域
 */
interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
}

export default function FooterSection({ 
  title, 
  children, 
  xs = 24, 
  sm = 12, 
  md = 6 
}: FooterSectionProps) {
  return (
    <Col xs={xs} sm={sm} md={md}>
      <div className="footer-section">
        <h4 className="section-title">{title}</h4>
        {children}
      </div>
    </Col>
  );
}
