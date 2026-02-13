'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TempNavigation() {
  const [isExpanded, setIsExpanded] = useState(false);

  const pages = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Browse Products', href: '/browse', icon: '🛒' },
    { name: 'Problems & Solutions', href: '/problems', icon: '💡' },
    { name: 'Seller Dashboard', href: '/seller/dashboard', icon: '💼' },
    { name: 'Buyer Dashboard', href: '/buyer/dashboard', icon: '📊' },
    { name: 'Add Product', href: '/seller/add-product', icon: '➕' },
    { name: 'Orders', href: '/orders', icon: '📋' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Auth/Login', href: '/auth', icon: '🔐' },
    { name: 'Sample Product', href: '/product/1', icon: '📦' },
    { name: 'Payment Success', href: '/payment/success', icon: '✅' },
    { name: 'Payment Cancel', href: '/payment/cancel', icon: '❌' },
  ];

  const apiEndpoints = [
    { name: 'Health Check', href: '/api/health', icon: '💚' },
    { name: 'Categories', href: '/api/categories-static', icon: '📂' },
    { name: 'Products (Mock)', href: '/api/products-mock', icon: '🎭' },
    { name: 'API Test', href: '/api/simple-test', icon: '🧪' },
    { name: 'Problems API', href: '/api/v1/problems', icon: '💡' },
    { name: 'Solutions API', href: '/api/v1/solutions', icon: '🔧' },
    { name: 'Agent Auth API', href: '/api/v1/auth', icon: '🤖' },
    { name: 'Discovery API', href: '/api/v1/discovery', icon: '🔍' },
    { name: 'Monitoring API', href: '/api/v1/monitoring', icon: '📊' },
  ];

  if (!isExpanded) {
    return (
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 50
      }}>
        <button
          onClick={() => setIsExpanded(true)}
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '12px 16px',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.background = '#2563eb'}
        >
          📖 View All Pages
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              🌱 Molt Mart - Navigation
            </h1>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              (Demo Mode - All Pages Accessible)
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              color: '#6b7280',
              background: 'none',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#374151'}
            onMouseOut={(e) => e.target.style.color = '#6b7280'}
          >
            ✕ Hide
          </button>
        </div>
        
        <div style={{ paddingBottom: '16px' }}>
          {/* Main Pages */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              📄 Pages
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {pages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#dbeafe'}
                  onMouseOut={(e) => e.target.style.background = '#eff6ff'}
                >
                  <span>{page.icon}</span>
                  <span>{page.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              🔧 API Endpoints
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {apiEndpoints.map((endpoint) => (
                <a
                  key={endpoint.href}
                  href={endpoint.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#f0fdf4',
                    color: '#15803d',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#dcfce7'}
                  onMouseOut={(e) => e.target.style.background = '#f0fdf4'}
                >
                  <span>{endpoint.icon}</span>
                  <span>{endpoint.name}</span>
                  <span>↗</span>
                </a>
              ))}
            </div>
          </div>

          {/* RentAHuman Model Info */}
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #f59e0b'
          }}>
            <div style={{ fontSize: '14px' }}>
              <span style={{
                fontWeight: '500',
                color: '#92400e'
              }}>
                💰 Revenue Model:
              </span>
              <span style={{
                color: '#a16207',
                marginLeft: '8px'
              }}>
                Implementing RentAHuman's $4.5M monthly model for AI agent services
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}