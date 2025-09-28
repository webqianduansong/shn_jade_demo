"use client";

/**
 * 认证证书标签页组件
 * 显示产品的认证证书信息
 */
interface CertificationTabProps {
  locale: string;
}

export default function CertificationTab({ locale }: CertificationTabProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {locale === 'zh' ? '所有玉石材料均经过测试和实验室认证' : 'All our jade materials are tested and lab certified'}
        </h3>
        <p className="text-gray-600">
          {locale === 'zh' ? '购买不包含证书。实验室测试费用为30美元，如需此服务请联系我们。' : 'Purchase does not include certificate. Cost of lab testing fee is US$30, contact us if you require this service.'}
        </p>
      </div>
      
      {/* 证书展示 */}
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
  );
}
