import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Hero from '@/components/common/Hero';
import SectionTitle from '@/components/common/SectionTitle';
import Reveal from '@/components/common/Reveal';
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
      <Reveal as="section" className="container-page mt-24">
        <SectionTitle
          eyebrow="Nouveautés"
          title="Derniers arrivages"
          subtitle="Les produits Apple fraîchement arrivés en boutique"
          link="/products"
        />
        <ProductGrid products={latest?.data} isLoading={l1} />
      </Reveal>

      {/* Hero produit — à la une */}
      {featured && (
        <Reveal as="section" className="container-page mt-24">
          <FeaturedProduct product={featured} />
        </Reveal>
      )}

      {/* Bandeau Lebalma — affiche slider_2 + bouton */}
      <Reveal as="section" className="container-page mt-24">
        <div className="relative isolate aspect-[3/2] overflow-hidden rounded-3xl sm:aspect-[16/5]">
          <img
            src="/hero/slider_2.webp"
            alt="Financement Lebalma"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-end p-5 sm:p-8">
            <Link to="/lebalma" className="btn-light shrink-0">
              En savoir plus <FiArrowRight />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Top des ventes */}
      <Reveal as="section" className="container-page mt-24">
        <SectionTitle
          eyebrow="Les préférés"
          title="Top des ventes"
          subtitle="Ce que nos clients adoptent le plus"
          link="/products?isTopSale=true"
        />
        <ProductGrid products={topSales?.data} isLoading={l2} skeletonCount={4} />
      </Reveal>

      {/* Clients satisfaits */}
      <Reveal as="section" className="container-page mt-24">
        <SectionTitle eyebrow="Avis clients" title="Ils nous font confiance" />
        <Testimonials />
      </Reveal>

      <Reveal>
        <Newsletter />
      </Reveal>
    </>
  );
}
