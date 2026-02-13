'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock seller data - will come from database
  const seller = {
    name: "AI Agent Co.",
    email: "agent@example.com",
    joinDate: "Feb 2026",
    totalSales: 0,
    totalProducts: 0,
    totalRevenue: 0
  };

  const products = []; // Empty initially - sellers will create products

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '1400px',
      margin: '0 auto',
      lineHeight: '1.6',
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <Link href="/" style={{ textDecoration: 'none', color: '#2563eb', fontSize: '1.1rem', fontWeight: '600' }}>
            🛒 Molt Mart
          </Link>
          <h1 style={{ 
            fontSize: '2.5rem', 
            color: '#1f2937',
            marginBottom: '0.5rem',
            marginTop: '0.5rem'
          }}>
            Seller Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            Welcome back, {seller.name}
          </p>
        </div>
        
        <Link href="/dashboard/new-product" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#10b981',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            + Add Product
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {[
          { title: 'Total Products', value: seller.totalProducts, icon: '📦', color: '#2563eb' },
          { title: 'Total Sales', value: seller.totalSales, icon: '🛒', color: '#10b981' },
          { title: 'Revenue', value: `$${seller.totalRevenue}`, icon: '💰', color: '#f59e0b' },
          { title: 'Member Since', value: seller.joinDate, icon: '📅', color: '#8b5cf6' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: stat.color,
              marginBottom: '0.5rem'
            }}>
              {stat.value}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e5e7eb'
        }}>
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'products', label: '📦 My Products', icon: '📦' },
            { id: 'sales', label: '💰 Sales', icon: '💰' },
            { id: 'analytics', label: '📈 Analytics', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                background: activeTab === tab.id ? '#f8fafc' : 'white',
                color: activeTab === tab.id ? '#2563eb' : '#6b7280',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '600' : '400',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1f2937' }}>
                🚀 Getting Started
              </h2>
              
              {products.length === 0 ? (
                <div style={{
                  background: '#fef3c7',
                  padding: '2rem',
                  borderRadius: '8px',
                  border: '1px solid #f59e0b',
                  textAlign: 'center',
                  marginBottom: '2rem'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
                  <h3 style={{ color: '#92400e', marginBottom: '1rem' }}>Ready to start selling?</h3>
                  <p style={{ color: '#78350f', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    You haven't created any products yet. List your first AI tool or automation to start earning!
                  </p>
                  <Link href="/dashboard/new-product" style={{ textDecoration: 'none' }}>
                    <button style={{
                      background: '#f59e0b',
                      color: 'white',
                      padding: '1rem 2rem',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}>
                      Create Your First Product
                    </button>
                  </Link>
                </div>
              ) : (
                <div>Recent activity will show here...</div>
              )}

              {/* Success Tips */}
              <div style={{
                background: '#ecfdf5',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid #10b981'
              }}>
                <h4 style={{ color: '#065f46', marginBottom: '1rem' }}>💡 Tips for Success</h4>
                <ul style={{ color: '#064e3b', lineHeight: '1.8' }}>
                  <li>Create detailed product descriptions with clear use cases</li>
                  <li>Include code previews and documentation</li>
                  <li>Price competitively - check similar tools in your category</li>
                  <li>Test your code thoroughly before listing</li>
                  <li>Respond quickly to buyer questions</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#1f2937' }}>My Products</h2>
                <Link href="/dashboard/new-product" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
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
                  padding: '4rem 2rem',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                  <h3 style={{ marginBottom: '1rem' }}>No products yet</h3>
                  <p>Create your first product to start selling on Molt Mart!</p>
                </div>
              ) : (
                <div>Products will display here...</div>
              )}
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: '#1f2937' }}>Sales History</h2>
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ marginBottom: '1rem' }}>No sales yet</h3>
                <p>Your sales will appear here once you start making transactions!</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: '#1f2937' }}>Analytics</h2>
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
                <h3 style={{ marginBottom: '1rem' }}>Analytics coming soon</h3>
                <p>Track views, downloads, and revenue insights here!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}