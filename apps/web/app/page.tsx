import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import GradeScale from '@/components/GradeScale';
import QuickStart from '@/components/QuickStart';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <GradeScale />
        <QuickStart />
      </main>
      <Footer />
    </>
  );
}
