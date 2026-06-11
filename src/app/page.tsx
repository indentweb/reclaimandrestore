import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Gallery from "@/components/Gallery";
import ServiceArea from "@/components/ServiceArea";
import Booking from "@/components/Booking";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <Process />
        <Gallery />
        <ServiceArea />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
