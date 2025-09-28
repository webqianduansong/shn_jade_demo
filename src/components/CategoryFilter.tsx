"use client";
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Select, Button, InputNumber, Drawer } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

interface CategoryFilterProps {
  onSortChange: (sortBy: string) => void;
  onPriceChange: (minPrice: number, maxPrice: number) => void;
  productCount: number;
}

export default function CategoryFilter({ onSortChange, onPriceChange, productCount }: CategoryFilterProps) {
  const t = useTranslations('products');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  const handleSortChange = (value: string) => {
    onSortChange(value);
  };

  const handlePriceChange = () => {
    onPriceChange(minPrice, maxPrice);
  };

  const sortOptions = [
    { label: t('popular'), value: 'popular' },
    { label: t('priceLow'), value: 'price-low' },
    { label: t('priceHigh'), value: 'price-high' },
    { label: t('newest'), value: 'newest' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              type="text"
            >
              {t('sortBy')}
            </Button>
          </div>

          {/* Product Count */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary">
              {productCount} {t('found')}
            </span>
          </div>

          {/* Desktop Sort */}
          <div className="hidden lg:flex items-center gap-4">
            <Select
              defaultValue="popular"
              style={{ width: 200 }}
              onChange={handleSortChange}
              options={sortOptions}
            />
          </div>

          {/* Mobile Sort */}
          <div className="lg:hidden w-full">
            <Select
              defaultValue="popular"
              style={{ width: '100%' }}
              onChange={handleSortChange}
              options={sortOptions}
            />
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <Drawer
          title="价格筛选"
          placement="bottom"
          height={300}
          open={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          className="lg:hidden"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-secondary mb-2">最低价格</label>
                <InputNumber
                  value={minPrice}
                  onChange={(value) => setMinPrice(value || 0)}
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-2">最高价格</label>
                <InputNumber
                  value={maxPrice}
                  onChange={(value) => setMaxPrice(value || 100000)}
                  style={{ width: '100%' }}
                  placeholder="100000"
                  min={0}
                />
              </div>
            </div>
            <Button
              type="primary"
              onClick={handlePriceChange}
              style={{ width: '100%' }}
            >
              应用筛选
            </Button>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
