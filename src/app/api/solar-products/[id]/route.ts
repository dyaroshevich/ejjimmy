import { NextRequest, NextResponse } from 'next/server';
import { getSolarProductById, updateSolarProduct, deleteSolarProduct } from '@/lib/solar/db';
import { createClient } from '@/lib/supabase-server';

// GET /api/solar-products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const product = await getSolarProductById(params.id, supabase);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching solar product:', error);
    return NextResponse.json({ error: 'Failed to fetch solar product' }, { status: 500 });
  }
}

// PUT /api/solar-products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const product = await updateSolarProduct(params.id, {
      name: body.name,
      brand: body.brand,
      model: body.model,
      type: body.type,
      power_kw: body.power_kw,
      price_thb: body.price_thb,
      specifications: body.specifications,
      image_url: body.image_url,
      description: body.description
    }, supabase);
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating solar product:', error);
    return NextResponse.json({ error: 'Failed to update solar product' }, { status: 500 });
  }
}

// DELETE /api/solar-products/[id] - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    
    // RBAC Check
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.app_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteSolarProduct(params.id, supabase);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting solar product:', error);
    return NextResponse.json({ error: 'Failed to delete solar product' }, { status: 500 });
  }
}
