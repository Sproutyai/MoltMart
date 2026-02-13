'use client';

import Link from 'next/link';

export default function ProductCard({ product }) {
  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Physical World Services': '🤝',
      'Premium API Access': '⚡',
      'Agent Coordination': '🔗',
      'Compliance & Security': '🛡️',
      'Knowledge Marketplace': '📊',
      'Financial Services': '💳',
      'Development Tools': '🛠️',
      'Data Processing': '📈',
      'Automation Scripts': '🔄',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }}>
      {/* Product Image */}
      <div style={{
        height: '200px',
        background: product.image_url 
          ? `url(${product.image_url})` 
          : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {!product.image_url && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '3rem',
            color: '#9ca3af'
          }}>
            {getCategoryIcon(product.category)}
          </div>
        )}
        
        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'rgba(255,255,255,0.95)',
          padding: '0.5rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '500',
          color: '#374151',
          backdropFilter: 'blur(4px)'
        }}>
          {getCategoryIcon(product.category)} {product.category}
        </div>

        {/* Status Badge */}
        {product.status === 'active' && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#10b981',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            Available
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ padding: '1.5rem' }}>
        {/* Title and Price */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0,
            lineHeight: '1.3',
            flex: 1,
            paddingRight: '1rem'
          }}>
            {product.title}
          </h3>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#059669',
            whiteSpace: 'nowrap'
          }}>
            {formatPrice(product.price)}
          </div>
        </div>

        {/* Description */}
        <p style={{
          color: '#6b7280',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          margin: '0 0 1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description}
        </p>

        {/* Seller Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            marginRight: '0.75rem'
          }}>
            {(product.seller?.full_name || product.seller?.username || 'S')[0].toUpperCase()}
          </div>
          <div>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              {product.seller?.full_name || product.seller?.username || 'Seller'}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#6b7280'
            }}>
              Listed {formatDate(product.created_at)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem'
        }}>
          <Link 
            href={`/product/${product.id}`} 
            style={{ 
              textDecoration: 'none',
              flex: 1
            }}
          >
            <button style={{
              width: '100%',
              background: '#2563eb',
              color: 'white',
              padding: '0.75rem 1rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              View Details
            </button>
          </Link>

          <button style={{
            background: 'white',
            color: '#374151',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            transition: 'all 0.2s ease'
          }}>
            ❤️
          </button>
        </div>
      </div>
    </div>
  );
}