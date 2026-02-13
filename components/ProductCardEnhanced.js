'use client';

import Link from 'next/link';
import WishlistButton from './WishlistButton';

export default function ProductCardEnhanced({ product, showWishlist = true, compact = false }) {
  if (!product) return null;

  const cardStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: compact ? '1rem' : '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={cardStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Wishlist Button */}
      {showWishlist && (
        <div style={{
          position: 'absolute',
          top: compact ? '0.5rem' : '1rem',
          right: compact ? '0.5rem' : '1rem',
          zIndex: 10
        }}>
          <WishlistButton productId={product.id} size={compact ? 'small' : 'normal'} />
        </div>
      )}

      {/* Product Image */}
      {product.image_urls && product.image_urls[0] && (
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <img 
            src={product.image_urls[0]} 
            alt={product.title}
            style={{
              width: '100%',
              height: compact ? '120px' : '180px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          />
        </Link>
      )}

      {/* Product Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'start', 
        marginBottom: '1rem',
        paddingRight: showWishlist ? '2rem' : '0'
      }}>
        <div style={{ flex: 1 }}>
          <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ 
              fontSize: compact ? '1.1rem' : '1.3rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '0.5rem',
              margin: 0,
              lineHeight: '1.3'
            }}>
              {product.title}
              {product.status === 'approved' && (
                <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>✓</span>
              )}
            </h3>
          </Link>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.85rem',
            background: '#f3f4f6',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            display: 'inline-block',
            margin: '0.5rem 0'
          }}>
            {product.category} • by {product.seller?.name || 'Anonymous'}
          </p>
        </div>
      </div>

      {/* Price and Rating */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          fontSize: compact ? '1.3rem' : '1.5rem', 
          fontWeight: 'bold', 
          color: product.is_free ? '#10b981' : '#2563eb'
        }}>
          {product.is_free ? 'FREE' : `$${product.price}`}
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '0.8rem', 
          color: '#6b7280'
        }}>
          <span>⭐ {product.average_rating || '0.0'}</span>
          <span>•</span>
          <span>{product.downloads || 0} downloads</span>
        </div>
      </div>
      
      {/* Description */}
      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
        <p style={{ 
          color: '#4b5563', 
          fontSize: compact ? '0.85rem' : '0.95rem',
          lineHeight: '1.5',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: compact ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.short_description || product.description}
        </p>
      </Link>
      
      {/* Tags */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {(product.tags || []).slice(0, compact ? 2 : 3).map(tag => (
          <span key={tag} style={{
            background: '#dbeafe',
            color: '#2563eb',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {tag}
          </span>
        ))}
        {(product.tags || []).length > (compact ? 2 : 3) && (
          <span style={{ 
            color: '#6b7280', 
            fontSize: '0.75rem',
            padding: '0.25rem 0'
          }}>
            +{product.tags.length - (compact ? 2 : 3)} more
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {!compact && (
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          marginTop: 'auto'
        }}>
          <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', flex: 1 }}>
            <button style={{
              width: '100%',
              background: '#2563eb',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              View Details
            </button>
          </Link>
          
          {product.demo_url && (
            <a 
              href={product.demo_url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={{
                background: '#f3f4f6',
                color: '#374151',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              title="View Demo"
              >
                🔗
              </button>
            </a>
          )}
        </div>
      )}

      {/* Quick Buy for Compact Mode */}
      {compact && (
        <div style={{ marginTop: 'auto' }}>
          <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              background: '#2563eb',
              color: 'white',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              View Details
            </button>
          </Link>
        </div>
      )}

      {/* Special Badges */}
      {product.is_featured && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          background: '#f59e0b',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Featured
        </div>
      )}

      {product.is_new && (
        <div style={{
          position: 'absolute',
          top: product.is_featured ? '2.5rem' : '1rem',
          left: '1rem',
          background: '#10b981',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          New
        </div>
      )}
    </div>
  );
}