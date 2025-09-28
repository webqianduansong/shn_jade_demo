"use client";
import { useTranslations } from 'next-intl';
import HeroCarousel from './HeroCarousel';
import FeaturesSection from './FeaturesSection';
import CategoriesSection from './CategoriesSection';
import ProductsSection from './ProductsSection';

interface HomePageClientProps {
  locale: string;
}

export default function HomePageClient({ locale }: HomePageClientProps) {
  const t = useTranslations();

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Selling points */}
      <FeaturesSection />

      {/* Categories */}
      <CategoriesSection locale={locale} />

      {/* Featured Products */}
      <ProductsSection locale={locale} />
    </>
  );
}
