import ContentClientLayout from './ContentClientLayout';
import { getSite } from '@/lib/site-server';

export function generateMetadata() {
  const { brand } = getSite();
  return {
    title: `${brand.name} — Content Factory`,
  };
}

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return <ContentClientLayout>{children}</ContentClientLayout>;
}
