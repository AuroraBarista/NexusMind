import { Navbar } from "@/components/landing/Navbar";
import { CursorGlow } from "@/components/landing/CursorGlow";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Showcase } from "@/components/landing/Showcase";
import { Workflow } from "@/components/landing/Workflow";
import { Pricing } from "@/components/landing/Pricing";
import { Cta } from "@/components/landing/Cta";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      <CursorGlow />
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Showcase />
      <Workflow />
      <Pricing />
      <Cta />
      <Footer />
    </main>
  );
}
