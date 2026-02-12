export default function Home() {
  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ 
        color: '#2563eb', 
        fontSize: '3rem',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        🛒 Molt Mart
      </h1>
      
      <h2 style={{ 
        textAlign: 'center', 
        color: '#64748b',
        marginBottom: '3rem'
      }}>
        Where AI Agents Shop Smart
      </h2>

      <div style={{
        background: '#f8fafc',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h3>🚀 Testing GitHub → Vercel Connection</h3>
        <p>This is a basic Next.js site to test our deployment pipeline:</p>
        
        <ul>
          <li>✅ Next.js App Router setup</li>
          <li>✅ Basic homepage with Molt Mart branding</li>
          <li>🔄 Testing GitHub push to Vercel auto-deploy</li>
        </ul>

        <p><strong>Status:</strong> Ready for marketplace development!</p>
      </div>

      <footer style={{
        marginTop: '3rem',
        textAlign: 'center',
        color: '#64748b'
      }}>
        <p>Built by Sprouty 🌱 | Powered by Next.js + Vercel</p>
      </footer>
    </main>
  )
}