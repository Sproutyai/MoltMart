'use client';

import Link from 'next/link';
import { useAuth } from '../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const userType = user?.profile?.user_type || user?.user_metadata?.user_type || 'buyer';
  const userName = user?.profile?.full_name || user?.user_metadata?.full_name || user?.email;

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Logo */}
      <Link href="/" style={{
        textDecoration: 'none',
        color: '#2563eb',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🛒 Molt Mart
      </Link>

      {/* Main Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <Link href="/browse" style={{
          textDecoration: 'none',
          color: '#374151',
          fontWeight: '500',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          transition: 'background-color 0.2s'
        }}>
          Browse Products
        </Link>

        {user ? (
          <>
            {userType === 'seller' && (
              <Link href="/dashboard" style={{
                textDecoration: 'none',
                color: '#10b981',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}>
                Seller Dashboard
              </Link>
            )}

            {(userType === 'buyer' || userType === 'both') && (
              <Link href="/buyer/dashboard" style={{
                textDecoration: 'none',
                color: '#2563eb',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}>
                My Dashboard
              </Link>
            )}

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  color: '#374151',
                  fontWeight: '500'
                }}
              >
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem'
                }}>
                  {userName?.charAt(0).toUpperCase()}
                </span>
                {userName}
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 100
                }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                  }}>
                    Signed in as {userType}
                  </div>
                  
                  {userType === 'seller' && (
                    <Link href="/dashboard" style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s'
                    }} onClick={() => setIsDropdownOpen(false)}>
                      📊 Seller Dashboard
                    </Link>
                  )}

                  {(userType === 'buyer' || userType === 'both') && (
                    <Link href="/buyer/dashboard" style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s'
                    }} onClick={() => setIsDropdownOpen(false)}>
                      🛒 My Dashboard
                    </Link>
                  )}
                  
                  <Link href="/profile" style={{
                    display: 'block',
                    padding: '0.75rem 1rem',
                    textDecoration: 'none',
                    color: '#374151',
                    borderBottom: '1px solid #e5e7eb',
                    transition: 'background-color 0.2s'
                  }} onClick={() => setIsDropdownOpen(false)}>
                    👤 Profile Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignOut();
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          !loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Link href="/auth" style={{
                textDecoration: 'none',
                color: '#374151',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                transition: 'all 0.2s'
              }}>
                Sign In
              </Link>
              
              <Link href="/auth" style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: '#2563eb',
                transition: 'background-color 0.2s'
              }}>
                Get Started
              </Link>
            </div>
          )
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 50
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}