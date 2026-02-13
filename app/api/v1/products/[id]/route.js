import { NextResponse } from 'next/server';
import { createServiceClient } from '../../../../../lib/supabase';

// GET /api/v1/products/[id] - Get single product
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const supabase = createServiceClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:users!seller_id(id, full_name, username, email)
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Product not found'
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch product'
    }, { status: 500 });
  }
}

// PUT /api/v1/products/[id] - Update product (seller only)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const supabase = createServiceClient();
    const updates = await request.json();

    // Remove fields that shouldn't be updated
    const allowedFields = ['title', 'description', 'category', 'price', 'image_url', 'status'];
    const filteredUpdates = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 });
    }

    // Validate price if provided
    if (filteredUpdates.price && (isNaN(filteredUpdates.price) || filteredUpdates.price <= 0)) {
      return NextResponse.json({
        success: false,
        error: 'Price must be a positive number'
      }, { status: 400 });
    }

    filteredUpdates.updated_at = new Date().toISOString();

    const { data: product, error } = await supabase
      .from('products')
      .update(filteredUpdates)
      .eq('id', id)
      .select(`
        *,
        seller:users!seller_id(id, full_name, username, email)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Product not found or unauthorized'
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update product'
    }, { status: 500 });
  }
}

// DELETE /api/v1/products/[id] - Delete/deactivate product
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const supabase = createServiceClient();

    // Soft delete by setting status to inactive
    const { data: product, error } = await supabase
      .from('products')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, title')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Product not found or unauthorized'
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { id: product.id, title: product.title },
      message: 'Product deactivated successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete product'
    }, { status: 500 });
  }
}