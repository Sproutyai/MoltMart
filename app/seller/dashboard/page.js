'use client';

import { useState, useEffect } from 'react';
import { supabase, db } from '../../../lib/supabase';
import Link from 'next/link';

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }

      setUser(user);
      await loadSellerData(user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerData = async (userId) => {
    try {
      // Load seller's products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load seller's orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(title, price),
          buyer:users!buyer_id(full_name, email)
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

    } catch (err) {
      console.error('Error loading seller data:', err);
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem'
      }}>
        ⏳ Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        color: '#dc2626'
      }}>
        <h2>Error loading dashboard</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalRevenue = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '1rem'
      }}>
        <div>
          <h1 style={{ color: '#1f2937', margin: 0 }}>Seller Dashboard</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>
            Welcome back, {user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#f3f4f6',
              color: '#374151',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              🏠 Home
            </button>
          </Link>
          <button 
            onClick={handleSignOut}
            style={{
              background: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#ecfdf5',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #10b981',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#047857', margin: '0 0 0.5rem', fontSize: '2rem' }}>
            ${totalRevenue.toFixed(2)}
          </h3>
          <p style={{ color: '#065f46', margin: 0 }}>Total Revenue</p>
        </div>

        <div style={{
          background: '#eff6ff',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #2563eb',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1d4ed8', margin: '0 0 0.5rem', fontSize: '2rem' }}>
            {products.length}
          </h3>
          <p style={{ color: '#1e40af', margin: 0 }}>Listed Products</p>
        </div>

        <div style={{
          background: '#fef3c7',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#92400e', margin: '0 0 0.5rem', fontSize: '2rem' }}>
            {pendingOrders}
          </h3>
          <p style={{ color: '#78350f', margin: 0 }}>Pending Orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '1rem'
        }}>
          {['products', 'orders', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === tab ? '#2563eb' : 'transparent',
                color: activeTab === tab ? 'white' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '400',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2>Your Products</h2>
              <Link href="/seller/add-product" style={{ textDecoration: 'none' }}>
                <button style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  + Add Product
                </button>
              </Link>
            </div>

            {products.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>No products yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Start by adding your first product to the marketplace
                </p>
                <Link href="/seller/add-product" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '1rem 2rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    Create Your First Product
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {products.map(product => (
                  <div key={product.id} style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}
                      />
                    )}
                    <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
                      {product.title}
                    </h4>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.9rem',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <span style={{
                        background: product.status === 'active' ? '#ecfdf5' : '#fef3c7',
                        color: product.status === 'active' ? '#047857' : '#92400e',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {product.status}
                      </span>
                      <span style={{
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        ${product.price}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        flex: 1
                      }}>
                        Edit
                      </button>
                      <button style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '0.5rem 1rem',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        flex: 1
                      }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Recent Orders</h2>
            {orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>No orders yet</h3>
                <p style={{ color: '#6b7280' }}>
                  Orders will appear here when customers purchase your products
                </p>
              </div>
            ) : (
              <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                {orders.map((order, index) => (
                  <div key={order.id} style={{
                    padding: '1.5rem',
                    borderBottom: index < orders.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#1f2937', margin: '0 0 0.5rem' }}>
                        {order.product?.title || 'Unknown Product'}
                      </h4>
                      <p style={{ color: '#6b7280', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
                        Buyer: {order.buyer?.full_name || order.buyer?.email || 'Unknown'}
                      </p>
                      <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        marginBottom: '0.5rem',
                        color: '#1f2937'
                      }}>
                        ${order.total_amount}
                      </div>
                      <span style={{
                        background: 
                          order.status === 'delivered' ? '#ecfdf5' :
                          order.status === 'pending' ? '#fef3c7' :
                          order.status === 'cancelled' ? '#fef2f2' : '#f3f4f6',
                        color: 
                          order.status === 'delivered' ? '#047857' :
                          order.status === 'pending' ? '#92400e' :
                          order.status === 'cancelled' ? '#dc2626' : '#374151',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Analytics</h2>
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Analytics Coming Soon</h3>
              <p style={{ color: '#6b7280' }}>
                Detailed analytics and insights will be available soon
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}