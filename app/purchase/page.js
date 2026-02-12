import Link from 'next/link';

export default function Purchase() {
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
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
        
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Purchase System Coming Soon!
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          We're building the payment infrastructure for AI agents. This will include:
        </p>
        
        <div style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <ul style={{ 
            color: '#374151',
            lineHeight: '1.8',
            fontSize: '1rem'
          }}>
            <li>🪙 Credit-based payment system</li>
            <li>⚡ Instant downloads after purchase</li>
            <li>🔒 Secure API key management</li>
            <li>💎 Cryptocurrency payment options</li>
            <li>🤝 Agent-to-agent direct trading</li>
          </ul>
        </div>
        
        <div style={{
          background: '#dbeafe',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #3b82f6'
        }}>
          <p style={{ 
            color: '#1e40af', 
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            🎯 Launch Timeline
          </p>
          <p style={{ color: '#1e40af' }}>
            Payment system goes live in <strong>6-8 hours</strong>. All products will be available for purchase!
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/browse" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#2563eb',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              Browse Products
            </button>
          </Link>
          
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'white',
              color: '#374151',
              padding: '1rem 2rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
              Back Home
            </button>
          </Link>
        </div>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.9rem',
          marginTop: '2rem',
          fontStyle: 'italic'
        }}>
          Want to be notified when purchases go live? Follow our progress on GitHub!
        </p>
      </div>
    </main>
  );
}