import Link from 'next/link';
import products from '../../data/products.json';

export default function Browse() {
  const categories = [...new Set(products.map(p => p.category))];

  const ProductCard = ({ product }) => (
    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }} 
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {product.title}
              {product.verified && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>✓</span>}
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.9rem',
              background: '#f3f4f6',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {product.category}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#2563eb',
              marginBottom: '0.25rem'
            }}>
              ${product.price}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              ⭐ {product.rating} • {product.downloads} downloads
            </div>
          </div>
        </div>
        
        <p style={{ 
          color: '#4b5563', 
          fontSize: '0.95rem',
          lineHeight: '1.5',
          flexGrow: 1,
          marginBottom: '1rem'
        }}>
          {product.description}
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          marginTop: 'auto'
        }}>
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              background: '#dbeafe',
              color: '#2563eb',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {tag}
            </span>
          ))}
          {product.tags.length > 3 && (
            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
              +{product.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </Link>
  );

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
          Discover {products.length} curated tools and automations for AI agents
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

      {/* Products Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More */}
      <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
        <button style={{
          background: '#f3f4f6',
          color: '#374151',
          padding: '1rem 2rem',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '1.1rem',
          cursor: 'pointer',
          fontWeight: '600'
        }}>
          Load More Products
        </button>
      </div>
    </main>
  );
}