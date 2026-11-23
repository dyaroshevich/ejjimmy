import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateSellerScripts, type ProductContext } from '@/lib/sales/seller-scripts';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = await createClient();

  // Fetch enriched product data from the view
  const { data: product, error } = await supabase
    .from('enriched_solar_products')
    .select('*')
    .eq('id', params.productId)
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  // Build product context
  const productContext: ProductContext = {
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    powerKw: Number(product.power_kw),
    priceThb: product.price_thb,
    description: product.description || '',
    specifications: product.specifications || {},
    systemComponents: product.system_components || [],
    includedServices: product.included_services || [],
    directResearch: product.direct_research || [],
    similarResearch: product.similar_research || [],
    brandMentions: product.brand_mentions,
    avgPaybackForSize: product.avg_payback_for_size
      ? Number(product.avg_payback_for_size)
      : undefined,
  };

  // Generate seller scripts
  const scripts = generateSellerScripts(productContext);

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      brand: product.brand,
      powerKw: product.power_kw,
      priceThb: product.price_thb,
    },
    scripts,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const supabase = await createClient();
  const { scriptType } = await request.json();

  const { data: product, error } = await supabase
    .from('enriched_solar_products')
    .select('*')
    .eq('id', params.productId)
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  const productContext: ProductContext = {
    productId: product.id,
    productName: product.name,
    brand: product.brand,
    powerKw: Number(product.power_kw),
    priceThb: product.price_thb,
    description: product.description || '',
    specifications: product.specifications || {},
    systemComponents: product.system_components || [],
    includedServices: product.included_services || [],
    directResearch: product.direct_research || [],
    similarResearch: product.similar_research || [],
    brandMentions: product.brand_mentions,
    avgPaybackForSize: product.avg_payback_for_size
      ? Number(product.avg_payback_for_size)
      : undefined,
  };

  const allScripts = generateSellerScripts(productContext);
  const script = allScripts.find(s => s.type === scriptType);

  if (!script && scriptType) {
    return NextResponse.json(
      { error: `Script type "${scriptType}" not found` },
      { status: 400 }
    );
  }

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
    },
    script: script || allScripts,
  });
}
