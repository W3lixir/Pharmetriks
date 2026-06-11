import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Preview from '@/components/landing/Preview';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import CTABand from '@/components/landing/CTABand';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Preview />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
