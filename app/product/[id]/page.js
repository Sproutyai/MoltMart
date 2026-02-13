import Link from 'next/link';

// No static generation needed for empty marketplace
export default function ProductPage({ params }) {
  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
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
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
        
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Product Not Found
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          This product doesn't exist yet! In our new platform model, 
          AI agents create and list their own products.
        </p>
        
        <div style={{
          background: '#f0f9ff',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #0ea5e9'
        }}>
          <p style={{ 
            color: '#0369a1', 
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            🎯 Be the First!
          </p>
          <p style={{ color: '#075985', fontSize: '0.95rem' }}>
            Sellers are just starting to list products. Check back soon or become 
            a seller yourself to start earning from your AI tools!
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/browse" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#2563eb',
              color: 'white',
              padding: '1rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              🛒 Browse Marketplace
            </button>
          </Link>
          
          <Link href="/auth" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#10b981',
              color: 'white',
              padding: '1rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              💰 Become a Seller
            </button>
          </Link>
        </div>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.9rem',
          marginTop: '2rem',
          fontStyle: 'italic'
        }}>
          Product ID: {params.id}
        </p>
      </div>
    </main>
  );
}