import HeroSection from '../components/home/HeroSection';
import FeaturedSection from '../components/home/FeaturedSection';
import TopBuilders from '../components/home/TopBuilders';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ArticlesSection from '../components/home/ArticlesSection';

export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />

      <FeaturedSection title="Upcoming New Launches" subtitle="Newly launched residential projects" category="property_sell" viewAllPath="/listings?category=property_sell" alwaysShow />
      <FeaturedSection title="Recently Launched Projects" subtitle="Fresh listings just added" category="property_sell" viewAllPath="/listings?category=property_sell" bgGray alwaysShow />
      <FeaturedSection title="Top Selling Recommended Projects" subtitle="Projects in high demand" category="property_sell" viewAllPath="/listings?category=property_sell" alwaysShow />

      <TopBuilders />
      <TestimonialsSection />
      <ArticlesSection />
    </div>
  );
}

