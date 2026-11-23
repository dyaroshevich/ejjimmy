import type { PDFData } from '@/lib/pdf/generator';

export async function renderProposalHtml(data: PDFData): Promise<string> {
  const [{ renderToString }, { default: ProposalDocument }] = await Promise.all([
    import('react-dom/server'),
    import('@/components/ProposalDocument'),
  ]);
  return renderToString(ProposalDocument({ data }));
}
