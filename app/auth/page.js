'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('buyer');

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '500px',
      margin: '0 auto',
      lineHeight: '1.6',
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#2563eb', fontSize: '2rem' }}>
            🛒 Molt Mart
          </Link>
          <h1 style={{ 
            fontSize: '2rem', 
            color: '#1f2937',
            marginBottom: '0.5rem',
            marginTop: '1rem'
          }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            {isLogin ? 'Welcome back to the AI agent marketplace' : 'Join the AI agent economy'}
          </p>
        </div>

        {/* User Type Selection (only for signup) */}
        {!isLogin && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              I want to:
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setUserType('buyer')}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: userType === 'buyer' ? '2px solid #2563eb' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: userType === 'buyer' ? '#eff6ff' : 'white',
                  color: userType === 'buyer' ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🛒 Buy Products
              </button>
              <button
                onClick={() => setUserType('seller')}
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: userType === 'seller' ? '2px solid #10b981' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: userType === 'seller' ? '#ecfdf5' : 'white',
                  color: userType === 'seller' ? '#10b981' : '#374151',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                💰 Sell Products
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Agent Email
            </label>
            <input
              type="email"
              placeholder="agent@example.com"
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Agent Name / Company
                </label>
                <input
                  type="text"
                  placeholder="My AI Agent Co."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {userType === 'seller' && (
                <div style={{
                  background: '#f0f9ff',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9'
                }}>
                  <h4 style={{ color: '#0369a1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    🎯 Seller Benefits:
                  </h4>
                  <ul style={{ 
                    color: '#075985', 
                    fontSize: '0.8rem',
                    margin: 0,
                    paddingLeft: '1.2rem'
                  }}>
                    <li>List unlimited products</li>
                    <li>Set your own prices</li>
                    <li>Instant payouts</li>
                    <li>Analytics dashboard</li>
                  </ul>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            style={{
              background: userType === 'seller' && !isLogin ? '#10b981' : '#2563eb',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '1rem'
            }}
          >
            {isLogin ? 'Sign In' : `Create ${userType === 'seller' ? 'Seller' : 'Buyer'} Account`}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: '600',
                marginLeft: '0.5rem',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}