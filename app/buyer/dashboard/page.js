'use client';

import { useState, useEffect } from 'react';
import { supabase, db } from '../../../lib/supabase';
import Link from 'next/link';
import OrderTracker from '../../../components/OrderTracker';
import Recommendations from '../../../components/Recommendations';
import ProfileManager from '../../../components/ProfileManager';

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
      await loadBuyerData(user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerData = async (userId) => {
    try {
      // Load user profile
      const profileData = await db.getUser(userId);
      setProfile(profileData);

      // Load buyer's purchases
      const purchasesData = await db.getBuyerPurchases(userId);
      setPurchases(purchasesData || []);

      // Load wishlist
      const wishlistData = await db.getUserWishlist(userId);
      setWishlist(wishlistData || []);

      // Load recommendations
      const recommendationsData = await db.getRecommendations(userId, 6);
      setRecommendations(recommendationsData || []);

    } catch (err) {
      console.error('Error loading buyer data:', err);
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const removeFromWishlist = async (productId) => {
    try {
      await db.removeFromWishlist(user.id, productId);
      setWishlist(prev => prev.filter(item => item.product.id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#ecfdf5', color: '#047857', border: '#10b981' };
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'failed':
        return { bg: '#fef2f2', color: '#dc2626', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
    }
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
        ⏳ Loading your dashboard...
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

  const totalSpent = purchases
    .filter(purchase => purchase.status === 'completed')
    .reduce((sum, purchase) => sum + parseFloat(purchase.amount), 0);

  const pendingOrders = purchases.filter(purchase => purchase.status === 'pending').length;

  return (
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      background: '#f9fafb',
      minHeight: '100vh'
    }}>
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
          <h1 style={{ color: '#1f2937', margin: 0 }}>Buyer Dashboard</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>
            Welcome back, {profile?.name || user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/browse" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              🛒 Browse Products
            </button>
          </Link>
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
          background: '#eff6ff',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #2563eb',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#1d4ed8', margin: '0 0 0.5rem', fontSize: '2rem' }}>
            ${totalSpent.toFixed(2)}
          </h3>
          <p style={{ color: '#1e40af', margin: 0 }}>Total Spent</p>
        </div>

        <div style={{
          background: '#ecfdf5',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #10b981',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#047857', margin: '0 0 0.5rem', fontSize: '2rem' }}>
            {purchases.length}
          </h3>
          <p style={{ color: '#065f46', margin: 0 }}>Total Orders</p>
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

        <div style={{
          background: '#fdf2f8',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #ec4899',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#be185d', margin: '0 0 0.5rem', fontSize: '2rem' }}>
            {wishlist.length}
          </h3>
          <p style={{ color: '#9d174d', margin: 0 }}>Wishlist Items</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '1rem',
          overflowX: 'auto'
        }}>
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'orders', label: 'Order History', icon: '📦' },
            { key: 'wishlist', label: 'Wishlist', icon: '❤️' },
            { key: 'recommendations', label: 'For You', icon: '🎯' },
            { key: 'profile', label: 'Profile', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.key ? '#2563eb' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#6b7280',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? '600' : '400',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h2>
            
            {/* Quick Actions */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <Link href="/browse" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%',
                    background: '#2563eb',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}>
                    🛒 Browse Products
                  </button>
                </Link>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  style={{
                    width: '100%',
                    background: '#ec4899',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}
                >
                  ❤️ View Wishlist ({wishlist.length})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    width: '100%',
                    background: '#10b981',
                    color: 'white',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center'
                  }}
                >
                  📦 Track Orders
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Recent Orders */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
                {purchases.slice(0, 3).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {purchases.slice(0, 3).map(purchase => (
                      <div key={purchase.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '6px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            {purchase.product?.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{
                          ...getStatusColor(purchase.status),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}>
                          {purchase.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No orders yet</p>
                )}
              </div>

              {/* Recent Wishlist */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Recent Wishlist Items</h3>
                {wishlist.slice(0, 3).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {wishlist.slice(0, 3).map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: '#f9fafb',
                        borderRadius: '6px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            {item.product?.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            ${item.product?.price}
                          </div>
                        </div>
                        <Link href={`/product/${item.product?.id}`} style={{ textDecoration: 'none' }}>
                          <button style={{
                            background: '#2563eb',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}>
                            View
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No wishlist items yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Order History & Tracking</h2>
            {purchases.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>No orders yet</h3>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Start shopping to see your orders here
                </p>
                <Link href="/browse" style={{ textDecoration: 'none' }}>
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
                    Browse Products
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {purchases.map(purchase => (
                  <OrderTracker 
                    key={purchase.id} 
                    purchase={purchase}
                    onUpdate={(updatedPurchase) => {
                      setPurchases(prev => 
                        prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p)
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>My Wishlist</h2>
            {wishlist.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
                <h3 style={{ color: '#374151', marginBottom: '1rem' }}>Your wishlist is empty</h3>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Save products you're interested in for later
                </p>
                <Link href="/browse" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#ec4899',
                    color: 'white',
                    padding: '1rem 2rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    Discover Products
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {wishlist.map(item => (
                  <div key={item.id} style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    position: 'relative'
                  }}>
                    <button
                      onClick={() => removeFromWishlist(item.product.id)}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                      title="Remove from wishlist"
                    >
                      💔
                    </button>
                    
                    {item.product.image_urls && item.product.image_urls[0] && (
                      <img 
                        src={item.product.image_urls[0]} 
                        alt={item.product.title}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}
                      />
                    )}
                    
                    <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
                      {item.product.title}
                    </h4>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.9rem',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.product.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <span style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#2563eb'
                      }}>
                        ${item.product.price}
                      </span>
                      <span style={{
                        background: '#f3f4f6',
                        color: '#6b7280',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        {item.product.category}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/product/${item.product.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <button style={{
                          width: '100%',
                          background: '#2563eb',
                          color: 'white',
                          padding: '0.75rem',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <Recommendations 
            userId={user?.id} 
            title="Recommended For You"
            limit={12}
            showAll={true}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileManager 
            user={user}
            profile={profile}
            onUpdate={(updatedProfile) => {
              setProfile(updatedProfile);
            }}
          />
        )}
      </div>
    </main>
  );
}