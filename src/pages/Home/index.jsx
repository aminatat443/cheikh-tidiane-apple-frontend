import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import Hero from '@/components/common/Hero';
import SectionTitle from '@/components/common/SectionTitle';
import Reveal from '@/components/common/Reveal';
import LebalmaBand from '@/components/common/LebalmaBand';
import ProductGrid from '@/components/product/ProductGrid';
import FeaturedProduct from '@/components/product/FeaturedProduct';
import Testimonials from '@/components/common/Testimonials';
import Newsletter from '@/components/common/Newsletter';
import { productService } from '@/services/product.service';

export default function Home() {
  const { data: latest, isLoading: l1 } = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: () => productService.list({ sort: 'recent', limit: 8 }),
  });
  const { data: topSales, isLoading: l2 } = useQuery({
    queryKey: ['products', 'top'],
    queryFn: () => productService.list({ isTopSale: 'true', limit: 4 }),
  });

  const featured =
    latest?.data?.find((p) => p.isFeatured) || topSales?.data?.[0] || latest?.data?.[0];

  return (
    <>
      <Hero />

      {/* Derniers arrivages */}
      <Reveal as="section" className="container-page mt-20 sm:mt-24">
        <SectionTitle
          eyebrow="Nouveautés"
          title="Derniers arrivages"
          subtitle="Les produits Apple fraîchement arrivés en boutique"
          link="/products"
        />
        <ProductGrid products={latest?.data} isLoading={l1} />
        {latest?.data?.length >= 8 && (
          <div className="mt-8 text-center">
            <Link to="/products" className="btn-outline">Voir plus <FiArrowRight size={15} /></Link>
          </div>
        )}
      </Reveal>

      {/* Produit en vente flash */}
      {featured && (
        <Reveal as="section" className="container-page mt-20 sm:mt-24">
          <FeaturedProduct product={featured} />
        </Reveal>
      )}

      {/* Financement Lebalma */}
      <Reveal as="section" className="container-page mt-20 sm:mt-24">
        <LebalmaBand />
      </Reveal>

      {/* Top des ventes */}
      <Reveal as="section" className="container-page mt-20 sm:mt-24">
        <SectionTitle
          eyebrow="Les préférés"
          title="Top des ventes"
          subtitle="Ce que nos clients adoptent le plus"
          link="/products?isTopSale=true"
        />
        <ProductGrid products={topSales?.data} isLoading={l2} skeletonCount={4} />
        {topSales?.data?.length >= 4 && (
          <div className="mt-8 text-center">
            <Link to="/products?isTopSale=true" className="btn-outline">Voir plus <FiArrowRight size={15} /></Link>
          </div>
        )}
      </Reveal>

      {/* Avis clients */}
      <Reveal as="section" className="container-page mt-20 sm:mt-24">
        <Testimonials />
      </Reveal>

      <Reveal className="mt-20 sm:mt-24">
        <Newsletter />
      </Reveal>
    </>
  );
}
