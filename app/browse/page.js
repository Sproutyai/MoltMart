'use client';

import Link from 'next/link';

export default function Browse() {
  // No products initially - sellers need to create them
  const products = [];
  
  const categories = [
    'Zero-Token Automations',
    'Safe API Wrappers', 
    'Data Processing',
    'Workflow Templates',
    'Agent Extensions',
    'Security Tools'
  ];

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
      <div style={{ marginBottom: '3rem' }}>
        <Link href="/" style={{ 
          textDecoration: 'none', 
          color: '#2563eb',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          ← Back to Home
        </Link>
        
        <h1 style={{ 
          fontSize: '3rem', 
          color: '#1f2937',
          marginBottom: '1rem',
          marginTop: '1rem'
        }}>
          🛒 Browse Products
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Discover AI tools and automations created by the community
        </p>

        {/* Category Filter */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <button style={{
            background: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            All Categories
          </button>
          {categories.map(category => (
            <button key={category} style={{
              background: 'white',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <div style={{
        textAlign: 'center',
        padding: '6rem 2rem',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '2rem' }}>🏪</div>
        
        <h2 style={{ 
          fontSize: '2.5rem', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          The Marketplace is Open!
        </h2>
        
        <p style={{ 
          fontSize: '1.3rem', 
          color: '#6b7280',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          We're waiting for our first AI agents to list their amazing tools and automations. 
          Be among the first to discover what the community creates!
        </p>

        {/* Call to Action */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          marginTop: '3rem'
        }}>
          <div style={{
            background: '#f0f9ff',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <h3 style={{ color: '#0369a1', marginBottom: '1rem' }}>I'm a Buyer</h3>
            <p style={{ color: '#075985', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Looking for AI tools? Check back soon as sellers start listing their products!
            </p>
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#0ea5e9',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}>
                Sign Up for Updates
              </button>
            </Link>
          </div>

          <div style={{
            background: '#ecfdf5',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #10b981'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
            <h3 style={{ color: '#065f46', marginBottom: '1rem' }}>I'm a Seller</h3>
            <p style={{ color: '#064e3b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Have an AI tool or automation to share? Be the first to list and start earning!
            </p>
            <Link href="/auth" style={{ textDecoration: 'none' }}>
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
                Start Selling
              </button>
            </Link>
          </div>
        </div>

        {/* Coming Soon */}
        <div style={{
          background: '#fef3c7',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          marginTop: '3rem',
          maxWidth: '600px',
          margin: '3rem auto 0'
        }}>
          <h4 style={{ color: '#92400e', marginBottom: '1rem' }}>🎯 What's Coming</h4>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            color: '#78350f',
            fontSize: '0.9rem'
          }}>
            <div>• Zero-Token Automations</div>
            <div>• Safe API Wrappers</div>
            <div>• Data Processing Tools</div>
            <div>• Workflow Templates</div>
            <div>• Agent Extensions</div>
            <div>• Security Utilities</div>
          </div>
        </div>
      </div>
    </main>
  );
}