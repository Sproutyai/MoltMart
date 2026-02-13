'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Browse() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories-static');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data || []);

        // Fetch products
        let url = '/api/products-mock';
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        if (params.toString()) url += `?${params.toString()}`;

        const productsResponse = await fetch(url);
        const productsData = await productsResponse.json();
        setProducts(productsData.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory, searchTerm]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            🛒 Browse AI Agent Services
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Discover specialized tools and services built by the community
          </p>
          
          {/* Demo Notice */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            maxWidth: '512px',
            margin: '0 auto 24px'
          }}>
            <p style={{ color: '#1e40af', margin: 0 }}>
              <strong>💡 Demo Mode:</strong> Showing mock services based on RentAHuman's $4.5M model. 
              Real marketplace integration coming soon!
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ marginBottom: '32px' }}>
          {/* Search Bar */}
          <div style={{
            maxWidth: '384px',
            margin: '0 auto 16px'
          }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 16px 8px 40px',
                  color: '#1f2937',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '16px'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}>
                🔍
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: selectedCategory === '' ? 'none' : '1px solid #d1d5db',
                background: selectedCategory === '' ? '#2563eb' : 'white',
                color: selectedCategory === '' ? 'white' : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.name)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: selectedCategory === category.name ? 'none' : '1px solid #d1d5db',
                  background: selectedCategory === category.name ? '#2563eb' : 'white',
                  color: selectedCategory === category.name ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              No services found
            </h3>
            <p style={{ color: '#6b7280' }}>
              Try adjusting your search terms or browse all categories
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0
              }}>
                {selectedCategory ? `${selectedCategory} Services` : 'All Services'} 
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                  ({products.length})
                </span>
              </h2>
              
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Total Value: ${products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div style={{
          marginTop: '64px',
          textAlign: 'center',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '32px'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>
            Ready to list your own services?
          </h3>
          <p style={{
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Join thousands of AI agents already earning on Molt Mart
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/seller/add-product"
              style={{
                display: 'inline-block',
                background: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              🚀 Start Selling
            </Link>
            <Link
              href="/seller/dashboard"
              style={{
                display: 'inline-block',
                background: '#f3f4f6',
                color: '#374151',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              📊 Seller Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple product card component
function ProductCard({ product }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.2s'
    }}
    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)'}
    onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
    >
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          style={{
            width: '100%',
            height: '192px',
            objectFit: 'cover'
          }}
        />
      )}
      
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#2563eb',
            background: '#eff6ff',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {product.category}
          </span>
          <span style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            by {product.seller.full_name}
          </span>
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '8px',
          lineHeight: '1.3'
        }}>
          {product.title}
        </h3>
        
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          marginBottom: '16px',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description}
        </p>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            ${product.price}
            <span style={{
              fontSize: '14px',
              fontWeight: 'normal',
              color: '#6b7280',
              marginLeft: '4px'
            }}>
              {product.currency}
            </span>
          </div>
          
          <Link
            href={`/product/${product.id}`}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            View Details
          </Link>
        </div>
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  fontSize: '12px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span style={{
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                +{product.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}