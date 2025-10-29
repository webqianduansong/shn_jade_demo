"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Timeline, Spin, Button, Empty } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { apiGet } from '@/lib/apiClient';
import '../../orders.css';

interface TrackingEvent {
  timestamp: string;
  status: string;
  description: string;
  location?: string;
}

export default function TrackingPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = (params?.locale as string) || 'zh';
  const id = params?.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<{
    orderNo: string;
    trackingNumber: string;
    shippingCompany: string;
    timeline: TrackingEvent[];
  } | null>(null);

  useEffect(() => {
    loadTracking();
  }, [id]);

  const loadTracking = async () => {
    setLoading(true);
    
    // 获取订单信息（包含物流信息）
    const result = await apiGet(`/api/orders/${id}`);
    
    if (result.success && result.data?.order) {
      const order = result.data.order;
      
      // 模拟物流轨迹（实际应该从物流API获取）
      const mockTimeline: TrackingEvent[] = [];
      
      if (order.deliveredAt) {
        mockTimeline.push({
          timestamp: order.deliveredAt,
          status: locale === 'zh' ? '已签收' : 'Delivered',
          description: locale === 'zh' ? '您的快递已签收，感谢使用' : 'Your package has been delivered',
          location: order.shippingAddress?.city
        });
      }
      
      if (order.shippedAt) {
        mockTimeline.push({
          timestamp: new Date(new Date(order.shippedAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: locale === 'zh' ? '派送中' : 'Out for delivery',
          description: locale === 'zh' ? '快递员正在派送中，请保持电话畅通' : 'Package is out for delivery',
          location: order.shippingAddress?.city
        });
        
        mockTimeline.push({
          timestamp: new Date(new Date(order.shippedAt).getTime() + 12 * 60 * 60 * 1000).toISOString(),
          status: locale === 'zh' ? '到达目的地' : 'Arrived at destination',
          description: locale === 'zh' ? `快件已到达${order.shippingAddress?.city}分拨中心` : `Package arrived at ${order.shippingAddress?.city}`,
          location: order.shippingAddress?.city
        });
        
        mockTimeline.push({
          timestamp: order.shippedAt,
          status: locale === 'zh' ? '已揽收' : 'Picked up',
          description: locale === 'zh' ? `${order.shippingCompany || '快递公司'}已收取快件` : 'Package picked up by carrier',
          location: locale === 'zh' ? '发货地' : 'Origin'
        });
      }
      
      setTrackingData({
        orderNo: order.orderNo,
        trackingNumber: order.trackingNumber || locale === 'zh' ? '暂无' : 'N/A',
        shippingCompany: order.shippingCompany || locale === 'zh' ? '快递公司' : 'Carrier',
        timeline: mockTimeline
      });
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 160px)' 
      }}>
        <Spin size="large" tip={locale === 'zh' ? '加载中...' : 'Loading...'} />
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div className="orders-content">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ marginBottom: '16px', color: '#2d5a3d' }}
        >
          {locale === 'zh' ? '返回' : 'Back'}
        </Button>

        <h1 className="orders-title">
          <EnvironmentOutlined style={{ marginRight: '12px' }} />
          {locale === 'zh' ? '物流追踪' : 'Tracking'}
        </h1>

        <Card className="tracking-card">
          {!trackingData || !trackingData.trackingNumber || trackingData.trackingNumber === '暂无' || trackingData.trackingNumber === 'N/A' ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={locale === 'zh' ? '暂无物流信息' : 'No tracking info available'}
            >
              <p style={{ color: '#666', marginTop: '12px' }}>
                {locale === 'zh' ? '订单暂未发货，请耐心等待' : 'Order not shipped yet, please wait'}
              </p>
            </Empty>
          ) : (
            <>
              <div className="tracking-header">
                <div className="tracking-info">
                  <div className="info-row">
                    <span className="info-label">
                      {locale === 'zh' ? '订单号：' : 'Order No: '}
                    </span>
                    <span className="info-value">{trackingData.orderNo}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">
                      {locale === 'zh' ? '物流公司：' : 'Carrier: '}
                    </span>
                    <span className="info-value">{trackingData.shippingCompany}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">
                      {locale === 'zh' ? '运单号：' : 'Tracking No: '}
                    </span>
                    <span className="info-value tracking-number">{trackingData.trackingNumber}</span>
                  </div>
                </div>
              </div>

              <div className="tracking-timeline">
                <Timeline
                  items={trackingData.timeline.map((event, index) => ({
                    color: index === 0 ? 'green' : '#2d5a3d',
                    dot: index === 0 ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : undefined,
                    children: (
                      <div className="timeline-item">
                        <div className="timeline-header">
                          <strong className="timeline-status">{event.status}</strong>
                          <span className="timeline-time">
                            {new Date(event.timestamp).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                          </span>
                        </div>
                        <div className="timeline-desc">{event.description}</div>
                        {event.location && (
                          <div className="timeline-location">
                            <EnvironmentOutlined style={{ marginRight: '4px' }} />
                            {event.location}
                          </div>
                        )}
                      </div>
                    )
                  }))}
                />
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

