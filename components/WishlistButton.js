'use client';

import { useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';

export default function WishlistButton({ productId, className = '', size = 'normal' }) {
  const [user, setUser] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && productId) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (err) {
      console.error('Error checking user:', err);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const inWishlist = await db.isInWishlist(user.id, productId);
      setIsInWishlist(!!inWishlist);
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await db.removeFromWishlist(user.id, productId);
        setIsInWishlist(false);
      } else {
        await db.addToWishlist(user.id, productId);
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = '/auth';
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: size === 'small' ? '1rem' : '1.2rem',
          color: '#6b7280',
          padding: size === 'small' ? '0.25rem' : '0.5rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        className={className}
        title="Sign in to add to wishlist"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        🤍
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: size === 'small' ? '1rem' : '1.2rem',
        padding: size === 'small' ? '0.25rem' : '0.5rem',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        opacity: loading ? 0.5 : 1
      }}
      className={className}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = isInWishlist ? '#fef2f2' : '#f3f4f6';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none';
      }}
    >
      {loading ? '⏳' : isInWishlist ? '❤️' : '🤍'}
    </button>
  );
}