import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';

// GET /api/v1/products - List products with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const supabase = createServiceClient();

    // Parse query parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        seller:users!seller_id(id, full_name, username, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error } = await query;

    if (error) throw error;

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) throw countError;

    return NextResponse.json({
      success: true,
      data: products || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch products'
    }, { status: 500 });
  }
}

// POST /api/v1/products - Create new product (requires auth)
export async function POST(request) {
  try {
    const supabase = createServiceClient();
    const { 
      title, 
      description, 
      category, 
      price, 
      image_url,
      seller_id 
    } = await request.json();

    // Validate required fields
    if (!title || !description || !category || !price || !seller_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, description, category, price, seller_id'
      }, { status: 400 });
    }

    // Validate price
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Price must be a positive number'
      }, { status: 400 });
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        seller_id,
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price),
        image_url: image_url?.trim() || null,
        status: 'active'
      }])
      .select(`
        *,
        seller:users!seller_id(id, full_name, username, email)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create product'
    }, { status: 500 });
  }
}