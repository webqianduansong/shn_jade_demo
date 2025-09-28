"use client";
import { useState } from 'react';
import { Product } from '@/data/products';

interface ProductSpecificationsProps {
  product: Product;
  locale: string;
}

export default function ProductSpecifications({ product, locale }: ProductSpecificationsProps) {
  const [activeTab, setActiveTab] = useState('certification');

  const tabs = [
    { id: 'certification', label: locale === 'zh' ? '认证证书' : 'Certification' },
    { id: 'shipping', label: locale === 'zh' ? '配送信息' : 'Shipping' },
    { id: 'returns', label: locale === 'zh' ? '退换政策' : 'Returns' },
    { id: 'warranty', label: locale === 'zh' ? '保修服务' : 'Warranty' },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'certification' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {locale === 'zh' ? '所有玉石材料均经过测试和实验室认证' : 'All our jade materials are tested and lab certified'}
              </h3>
              <p className="text-gray-600">
                {locale === 'zh' ? '购买不包含证书。实验室测试费用为30美元，如需此服务请联系我们。' : 'Purchase does not include certificate. Cost of lab testing fee is US$30, contact us if you require this service.'}
              </p>
            </div>
            
            {/* Certificate Showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600">
                      {locale === 'zh' ? 'A级翡翠鉴定证书' : 'Grade A Jade Certificate'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'zh' ? '配送和处理时间' : 'Shipping & Processing Time'}
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>{locale === 'zh' ? '我们目前处理时间为1-3个工作日。配送时间（预估）取决于您的位置：' : 'Our processing time is currently 1–3 business days. Shipping times (estimated) depend on your location:'}</p>
                <ul className="space-y-2 ml-4">
                  <li>➑ {locale === 'zh' ? '香港: 1-2个工作日' : 'Hong Kong: 1-2 business days'}</li>
                  <li>➑ {locale === 'zh' ? '美国 & 加拿大: 7-10个工作日' : 'USA & Canada: 7–10 business days'}</li>
                  <li>➑ {locale === 'zh' ? '欧洲: 7-10个工作日' : 'Europe: 7–10 business days'}</li>
                  <li>➑ {locale === 'zh' ? '大多数亚洲国家: 5-9个工作日' : 'Most Asian countries: 5–9 business days'}</li>
                  <li>➑ {locale === 'zh' ? '其他国家: 10-15个工作日' : 'Other countries: 10–15 business days'}</li>
                </ul>
                <p className="text-red-600">❗ {locale === 'zh' ? '买家负责其国家的任何关税和进口税。我们不负责因海关或邮政服务问题造成的延误。' : 'Buyers are responsible for any customs and import taxes that may apply in their countries. We are not responsible for delays due to customs or problems with postal services.'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'zh' ? '退换政策' : 'Return & Exchange Policy'}
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>{locale === 'zh' ? '订购的商品可在交付后30天内退货或换货，前提是：' : 'Ordered items may be returned or exchanged within 30 days of delivery, provided that:'}</p>
                <ul className="space-y-2 ml-4">
                  <li>✔ {locale === 'zh' ? '要退货或换货的商品必须符合可销售条件，并附有原始包装' : 'The item(s) to be returned or exchanged must meet SELLABLE CONDITION, together with the original packaging'}</li>
                  <li>✔ {locale === 'zh' ? '可销售条件意味着商品仍在原始包装中，带有原始标签，商品未佩戴、未使用，处于原始销售状态' : 'Sellable Condition means that the Merchandise is still in its original packaging with the original labels, that the Merchandise is unworn, unused, and in the condition originally sold'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'zh' ? 'Gransky承诺' : 'Gransky Promise'}
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>{locale === 'zh' ? '在Gransky，我们珠宝中使用的每一块玉石都保证由天然玉石原石制成，并达到香港玉石实验室有限公司(HKJSL)可认证的A级翡翠等级。' : 'At Gransky, every piece of jade that is used in our jewelry is guaranteed to be created from natural jade rough and of Hong Kong Jade & Stone Laboratory Ltd. (HKJSL) certifiable jadeite grade in type A.'}</p>
                <p>{locale === 'zh' ? '这是100%天然的，没有任何形式的化学处理。' : 'That is 100% natural and free from any form of chemical treatment.'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">{locale === 'zh' ? '免费配送' : 'Free shipping'}</p>
              </div>
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">{locale === 'zh' ? '30天免费退货' : 'Free 30-Day Returns'}</p>
              </div>
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">{locale === 'zh' ? '2年保修' : '2-Year Warranty'}</p>
              </div>
              <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">{locale === 'zh' ? '香港手工制作' : 'Handmade in HongKong'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
