'use client';

import { useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';
import ProductCardEnhanced from './ProductCardEnhanced';
import Link from 'next/link';

export default function Recommendations({ 
  userId, 
  title = 'Recommended for You', 
  limit = 6, 
  showAll = false,
  compact = false 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId, limit]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let data;
      
      if (userId) {
        data = await db.getRecommendations(userId, limit);
      } else {
        // Get popular products for non-authenticated users
        data = await db.getPopularProducts(limit);
      }
      
      setRecommendations(data || []);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <p style={{ color: '#dc2626' }}>Error loading recommendations</p>
        <button 
          onClick={loadRecommendations}
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
        <h3 style={{ color: '#374151', marginBottom: '1rem' }}>No recommendations yet</h3>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          {userId 
            ? 'Make your first purchase to get personalized recommendations' 
            : 'Sign in to get personalized recommendations'}
        </p>
        <Link href={userId ? '/browse' : '/auth'} style={{ textDecoration: 'none' }}>
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
            {userId ? 'Browse Products' : 'Sign In'}
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ 
          fontSize: compact ? '1.5rem' : '2rem', 
          margin: 0, 
          color: '#1f2937' 
        }}>
          {title}
        </h2>
        
        {!showAll && recommendations.length >= limit && (
          <Link href="/browse" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'none',
              color: '#2563eb',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              textDecoration: 'underline'
            }}>
              View All →
            </button>
          </Link>
        )}
      </div>

      {userId && (
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '2rem',
          fontSize: compact ? '0.9rem' : '1rem'
        }}>
          Based on your purchase history and preferences
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: compact 
          ? 'repeat(auto-fit, minmax(250px, 1fr))'
          : 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: compact ? '1rem' : '1.5rem'
      }}>
        {recommendations.map(product => (
          <div key={product.id} style={{ position: 'relative' }}>
            <ProductCardEnhanced 
              product={product} 
              showWishlist={true}
              compact={compact}
            />
            
            {/* Recommendation Score Badge (for debugging/testing) */}
            {process.env.NODE_ENV === 'development' && product._score && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.5rem',
                background: '#f59e0b',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '600',
                zIndex: 5
              }}>
                Score: {Math.round(product._score)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {showAll && recommendations.length >= limit && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => loadRecommendations(limit + 6)}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              padding: '1rem 2rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Load More Recommendations
          </button>
        </div>
      )}

      {/* Tips for Better Recommendations */}
      {userId && recommendations.length < 3 && (
        <div style={{
          background: '#fef3c7',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          marginTop: '2rem'
        }}>
          <h4 style={{ color: '#92400e', marginBottom: '1rem' }}>
            💡 Get Better Recommendations
          </h4>
          <ul style={{ 
            color: '#78350f', 
            fontSize: '0.9rem',
            lineHeight: '1.6',
            paddingLeft: '1.2rem' 
          }}>
            <li>Make purchases to help us understand your preferences</li>
            <li>Add items to your wishlist to signal interest</li>
            <li>Browse different categories to expand your recommendations</li>
            <li>Leave reviews on products you've used</li>
          </ul>
        </div>
      )}
    </div>
  );
}