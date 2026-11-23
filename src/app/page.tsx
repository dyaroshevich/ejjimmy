import "./globals.css";
import LandingShell from "@/components/landing/LandingShell";
import HeroSection from "@/components/landing/HeroSection";
import PartnersSection from "@/components/landing/PartnersSection";
import SegmentsSection from "@/components/segments/Segments";
import SystemsSection from "@/components/landing/system/SystemsSection";
import CaseSection from "@/components/landing/case/CaseSection";
import ServicesSection from "@/components/landing/ServicesSection";
import SigenSection from "@/components/landing/SigenSection";
import StepSection from "@/components/landing/step/StepSection";
import KnowledgeSection from "@/components/landing/knowledge/KnowledgeSection";
import BlogSection from "@/components/landing/knowledge/BlogSection";
import ContactSection from "@/components/landing/contact/ContactSection";
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { HERO_COOKIE, DEFAULT_HERO_VARIANT, activeHeroVariant, isHeroVariantId } from '@/lib/hero-variants';
import { createClient } from '@/lib/supabase-server';
import { postsForLocale } from '@/lib/blog-locale';
import { getSite } from '@/lib/site-server';
import type { SectionId } from '@/lib/site.config';

async function getBlogPosts(locale: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
  return postsForLocale(data || [], locale);
}

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { hero?: string; stamp?: string } }) {
  const locale = await getLocale();
  // Three storefronts share this page; the hostname decides which bands it renders. Hero and
  // contact are always on — a page without either is not a sales page.
  const { sections } = getSite();
  const has = (id: SectionId) => sections.includes(id);
  const blogPosts = has('blog') ? await getBlogPosts(locale) : [];
  // The middleware pins the cookie; ?hero=N only overrides this render (review, screenshots).
  const pinned = cookies().get(HERO_COOKIE)?.value;
  const forced = searchParams?.hero;
  const heroVariant = isHeroVariantId(forced)
    ? forced
    : activeHeroVariant(pinned) ?? DEFAULT_HERO_VARIANT;
  // `?stamp=N` previews a phone layout of the 0฿ sticker (globals.css); a review hook like `?hero=`,
  // not a visitor-facing setting, so nothing persists it. 3 is the owner's pick.
  const stampLayout: '1' | '2' | '3' =
    searchParams?.stamp === '1' ? '1' : searchParams?.stamp === '2' ? '2' : '3';

  return (
    <LandingShell>
      <HeroSection heroVariant={heroVariant} stampLayout={stampLayout} />
      {has('partners') && <PartnersSection />}
      {has('segments') && <SegmentsSection />}
      {has('systems') && <SystemsSection />}
      {has('cases') && <CaseSection />}
      {has('services') && <ServicesSection />}
      {has('sigen') && <SigenSection />}
      {has('steps') && <StepSection />}
      {has('knowledge') && <KnowledgeSection />}
      {has('blog') && <BlogSection posts={blogPosts} />}
      <ContactSection />
    </LandingShell>
  );
}
