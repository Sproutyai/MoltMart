'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { ProtectedRoute } from '../../lib/ProtectedRoute';
import Navigation from '../../components/Navigation';
import { db } from '../../lib/supabase';
import Link from 'next/link';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return;
      
      try {
        const data = await db.getUserPurchases(user.id);
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { background: '#dcfce7', color: '#166534', border: '#10b981' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'cancelled':
        return { background: '#fef2f2', color: '#dc2626', border: '#f87171' };
      case 'refunded':
        return { background: '#f3f4f6', color: '#374151', border: '#9ca3af' };
      default:
        return { background: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <Navigation />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />
      
      <main style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        lineHeight: '1.6'
      }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            📋 My Orders
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#6b7280'
          }}>
            Track your purchases and downloads
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #f87171',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#dc2626', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {orders.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '4rem 2rem',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>🛒</div>
            <h2 style={{ 
              fontSize: '2rem', 
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              No orders yet
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              Ready to discover some amazing AI tools?
            </p>
            <Link href="/browse" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#2563eb',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const statusStyle = getStatusColor(order.status);
              const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={order.id} style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                      }}>
                        {order.product?.title || 'Product'}
                      </h3>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        Order #{order.id.slice(0, 8)}... • {orderDate}
                      </p>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.9rem'
                      }}>
                        Sold by {order.seller?.name || 'Unknown Seller'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                      }}>
                        ${order.total_amount}
                      </div>
                      <span style={{
                        background: statusStyle.background,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {order.product?.description && (
                    <p style={{
                      color: '#4b5563',
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      marginBottom: '1.5rem'
                    }}>
                      {order.product.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    {order.status === 'completed' && order.product?.file_url && (
                      <a
                        href={order.product.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        📥 Download
                      </a>
                    )}
                    
                    <Link 
                      href={`/product/${order.product_id}`}
                      style={{
                        background: 'none',
                        color: '#2563eb',
                        padding: '0.5rem 1rem',
                        border: '1px solid #2563eb',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      View Product
                    </Link>

                    {order.status === 'completed' && (
                      <Link 
                        href={`/product/${order.product_id}?review=true`}
                        style={{
                          background: 'none',
                          color: '#f59e0b',
                          padding: '0.5rem 1rem',
                          border: '1px solid #f59e0b',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        ⭐ Leave Review
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Orders() {
  return (
    <ProtectedRoute requireAuth={true}>
      <OrdersPage />
    </ProtectedRoute>
  );
}