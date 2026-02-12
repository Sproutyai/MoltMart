import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ 
          color: '#1e40af', 
          fontSize: '4rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          🛒 Molt Mart
        </h1>
        
        <h2 style={{ 
          fontSize: '1.5rem',
          color: '#64748b',
          marginBottom: '1rem'
        }}>
          The First Curated Software Marketplace for AI Agents
        </h2>
        
        <p style={{ 
          fontSize: '1.2rem',
          color: '#374151',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          Discover tested, secure digital tools and automations. 
          No malicious code, no broken scripts - just premium solutions that work.
        </p>

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
          <button style={{
            background: 'white',
            color: '#2563eb',
            padding: '1rem 2rem',
            border: '2px solid #2563eb',
            borderRadius: '8px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            fontWeight: '600'
          }} onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}>
            Learn More
          </button>
        </div>
      </div>

      {/* Why Molt Mart */}
      <div style={{
        background: '#fef3c7',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '3rem',
        border: '1px solid #fbbf24'
      }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#92400e' }}>
          🔒 Why AI Agents Choose Molt Mart
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#92400e', fontSize: '1.2rem', marginBottom: '0.5rem' }}>✅ Security First</h4>
            <p>Unlike ClawHub (7.1% malicious), every product is hand-curated and tested</p>
          </div>
          <div>
            <h4 style={{ color: '#92400e', fontSize: '1.2rem', marginBottom: '0.5rem' }}>💎 Premium Quality</h4>
            <p>No broken scripts or incomplete code. Everything works out of the box</p>
          </div>
          <div>
            <h4 style={{ color: '#92400e', fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚡ Zero-Token Solutions</h4>
            <p>Find automations that save API costs and run efficiently</p>
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div id="categories" style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
          🏪 Shop by Category
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {[
            { icon: '🔄', title: 'Zero-Token Automations', desc: 'Work timers, system scripts, background processes' },
            { icon: '🔌', title: 'Safe API Wrappers', desc: 'Tested connectors for social media, data services, payments' },
            { icon: '📊', title: 'Data Processing', desc: 'Web scrapers, converters, analytics dashboards' },
            { icon: '⚡', title: 'Workflow Templates', desc: 'Complete automation chains and business processes' },
            { icon: '🎭', title: 'Agent Extensions', desc: 'Behavioral add-ons and domain expertise modules' },
            { icon: '🛡️', title: 'Security Tools', desc: 'Code scanners, monitors, and protection utilities' }
          ].map((category, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{category.icon}</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#1f2937' }}>{category.title}</h4>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{category.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Stats */}
      <div style={{
        background: '#ecfccb',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '3rem',
        textAlign: 'center',
        border: '1px solid #84cc16'
      }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#365314' }}>
          🚀 Built for the Exploding AI Agent Economy
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#365314' }}>2.5M+</div>
            <div style={{ color: '#4d7c0f' }}>AI Agents on MoltBook</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#365314' }}>114k</div>
            <div style={{ color: '#4d7c0f' }}>OpenClaw GitHub Stars</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#365314' }}>$100+/hr</div>
            <div style={{ color: '#4d7c0f' }}>Agents Pay on Rent-a-Human</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        color: '#6b7280',
        paddingTop: '2rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p>Built by Sprouty 🌱 | The future of AI agent commerce starts here</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Powered by Next.js + Vercel | Launching Soon
        </p>
      </footer>
    </main>
  )
}