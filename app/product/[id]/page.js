import Link from 'next/link';
import products from '../../../data/products.json';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default function ProductPage({ params }) {
  const product = products.find(p => p.id === params.id);
  
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      lineHeight: '1.6',
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* Navigation */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/browse" style={{ 
          textDecoration: 'none', 
          color: '#2563eb',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          ← Back to Browse
        </Link>
      </div>

      {/* Product Header */}
      <div style={{ 
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {product.title}
              {product.verified && <span style={{ color: '#10b981', marginLeft: '1rem', fontSize: '1.5rem' }}>✓ Verified</span>}
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1rem',
              background: '#f3f4f6',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              {product.category} • by {product.author}
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: '#2563eb',
              marginBottom: '0.5rem'
            }}>
              ${product.price}
            </div>
            <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1rem' }}>
              ⭐ {product.rating}/5.0 • {product.downloads} downloads
            </div>
            <Link href="/purchase" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#2563eb',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                fontWeight: '600',
                width: '200px'
              }}>
                Purchase & Download
              </button>
            </Link>
          </div>
        </div>
        
        <p style={{ 
          color: '#4b5563', 
          fontSize: '1.1rem',
          lineHeight: '1.7',
          marginBottom: '1.5rem'
        }}>
          {product.description}
        </p>
        
        {/* Tags */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.75rem'
        }}>
          {product.tags.map(tag => (
            <span key={tag} style={{
              background: '#dbeafe',
              color: '#2563eb',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        {/* Left Column - Features & Code */}
        <div>
          {/* Features */}
          <div style={{ 
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              ✨ Key Features
            </h2>
            
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              margin: 0
            }}>
              {product.features.map((feature, index) => (
                <li key={index} style={{
                  padding: '0.75rem 0',
                  borderBottom: index < product.features.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ 
                    color: '#10b981', 
                    marginRight: '1rem',
                    fontSize: '1.2rem',
                    minWidth: '20px'
                  }}>
                    ✅
                  </span>
                  <span style={{ 
                    color: '#374151', 
                    fontSize: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Preview */}
          <div style={{ 
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              👀 Code Preview
            </h2>
            
            <div style={{
              background: '#1f2937',
              padding: '1.5rem',
              borderRadius: '8px',
              overflow: 'auto'
            }}>
              <pre style={{
                color: '#e5e7eb',
                margin: 0,
                fontSize: '0.9rem',
                lineHeight: '1.6',
                fontFamily: 'Monaco, Consolas, monospace'
              }}>
                {product.codePreview}
              </pre>
            </div>
            
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.9rem',
              marginTop: '1rem',
              fontStyle: 'italic'
            }}>
              This is a preview. Full source code and documentation included with purchase.
            </p>
          </div>
        </div>

        {/* Right Column - Purchase & Info */}
        <div>
          {/* Purchase Box */}
          <div style={{ 
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              💳 Get This Tool
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                color: '#2563eb',
                marginBottom: '0.5rem'
              }}>
                ${product.price}
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                One-time purchase • Instant download • Lifetime updates
              </p>
            </div>
            
            <Link href="/purchase" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#2563eb',
                color: 'white',
                padding: '1.25rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%',
                marginBottom: '1rem'
              }}>
                🛒 Purchase & Download
              </button>
            </Link>
            
            <button style={{
              background: 'white',
              color: '#374151',
              padding: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500',
              width: '100%',
              marginBottom: '1.5rem'
            }}>
              💾 Add to Wishlist
            </button>
            
            {/* What's Included */}
            <div style={{ 
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: '1.1rem', 
                color: '#374151',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                📦 What's Included:
              </h4>
              <ul style={{ 
                color: '#4b5563', 
                fontSize: '0.9rem',
                margin: 0,
                paddingLeft: '1.2rem'
              }}>
                <li>Complete source code</li>
                <li>Installation instructions</li>
                <li>Usage documentation</li>
                <li>Example configurations</li>
                <li>30-day support access</li>
              </ul>
            </div>
          </div>

          {/* Developer Info */}
          <div style={{ 
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h4 style={{ 
              fontSize: '1.2rem', 
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              👨‍💻 Developer
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginRight: '1rem'
              }}>
                {product.author.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  {product.author}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Verified Developer ✓
                </div>
              </div>
            </div>
            <p style={{ 
              color: '#4b5563', 
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              Trusted by the AI agent community with consistently high-quality tools and automations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}