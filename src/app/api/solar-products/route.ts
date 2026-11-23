import { NextRequest, NextResponse } from 'next/server';
import { getSolarProducts, getSolarProductById, createSolarProduct, updateSolarProduct, deleteSolarProduct } from '@/lib/solar/db';
import { createClient } from '@/lib/supabase-server';

// GET /api/solar-products - List products with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const type = searchParams.get('type') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const minPower = searchParams.get('minPower') ? parseInt(searchParams.get('minPower')!) : undefined;
    const maxPower = searchParams.get('maxPower') ? parseInt(searchParams.get('maxPower')!) : undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const { data, count } = await getSolarProducts({
      type,
      brand,
      minPower,
      maxPower,
      search,
      limit,
      offset,
      supabase
    });

    return NextResponse.json({ data, count });
  } catch (error) {
    console.error('Error fetching solar products:', error);
    return NextResponse.json({ error: 'Failed to fetch solar products' }, { status: 500 });
  }
}

// POST /api/solar-products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // RBAC Check
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const product = await createSolarProduct({
      name: body.name,
      brand: body.brand || '',
      model: body.model || '',
      type: body.type,
      power_kw: body.power_kw,
      price_thb: body.price_thb,
      specifications: body.specifications || {},
      image_url: body.image_url || '',
      description: body.description || ''
    }, supabase);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating solar product:', error);
    return NextResponse.json({ error: 'Failed to create solar product' }, { status: 500 });
  }
}