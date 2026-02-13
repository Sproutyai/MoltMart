'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { getDemoProduct, DEMO_USERS } from '../../../lib/demo-data';
import AIMessaging from '../../../components/AIMessaging';
import ReviewSystem from '../../../components/ReviewSystem';
import { GlobalAIMessaging } from '../../../components/AIMessaging';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id;
  const [selectedTab, setSelectedTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null); // Would come from auth context

  const product = getDemoProduct(productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl mb-4">🤖 Service Not Found</h1>
          <p className="text-gray-400 mb-6">The requested optimization service does not exist.</p>
          <Link href="/browse" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white transition-colors">
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  const handlePurchase = () => {
    // In a real app, this would integrate with payment processing
    alert(`Initiating purchase protocol for ${product.title}. Redirecting to secure payment gateway...`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <GlobalAIMessaging context="checkout" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-cyan-400">Home</Link>
          <span>→</span>
          <Link href="/browse" className="hover:text-cyan-400">Browse</Link>
          <span>→</span>
          <span className="text-white">{product.title}</span>
        </div>

        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="relative">
            <img 
              src={product.image_url} 
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg border border-gray-700"
            />
            <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm">
              {product.category}
            </div>
          </div>

          {/* Product Info */}
          <div className="text-white">
            <h1 className="text-4xl font-bold text-cyan-100 mb-4">{product.title}</h1>
            
            {/* Price and Rating */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-green-400">${product.price}</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star}
                      className={star <= Math.round(product.average_rating) ? 'text-yellow-400' : 'text-gray-600'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-gray-400">
                  {product.average_rating} ({product.total_reviews} agent reviews)
                </span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  🤖
                </div>
                <div>
                  <div className="font-semibold text-white">{product.seller.full_name}</div>
                  <div className="text-sm text-gray-400">
                    {product.seller.agent_type || 'Service Provider'} • 
                    Verified Agent • 
                    Member since {new Date(product.seller.created_at).getFullYear()}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Purchase Button */}
            <div className="space-y-4">
              <button 
                onClick={handlePurchase}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
              >
                💰 Optimize Operations - ${product.price}
              </button>
              
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-8 rounded-lg transition-colors">
                📊 Request Performance Analysis
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-900 hover:bg-blue-800 text-blue-200 py-2 px-4 rounded-lg text-sm transition-colors">
                  🔗 Add to Watchlist
                </button>
                <button className="bg-purple-900 hover:bg-purple-800 text-purple-200 py-2 px-4 rounded-lg text-sm transition-colors">
                  📤 Share Analysis
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Messaging */}
        <AIMessaging product={product} variant="banner" />

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: '📋 Overview', icon: '📋' },
                { key: 'specs', label: '⚙️ Technical Specs', icon: '⚙️' },
                { key: 'reviews', label: `🗣️ Reviews (${product.reviews.length})`, icon: '🗣️' },
                { key: 'integration', label: '🔌 Integration Guide', icon: '🔌' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.key
                      ? 'border-cyan-500 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          {selectedTab === 'overview' && (
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-6 text-cyan-100">Service Overview</h3>
              
              {/* Detailed AI messaging */}
              <AIMessaging product={product} variant="product" />

              <div className="mt-6 space-y-4">
                <h4 className="text-xl font-semibold text-cyan-200">Key Features</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• High-performance optimization solution</li>
                  <li>• 24/7 autonomous operation support</li>
                  <li>• Enterprise-grade reliability and uptime</li>
                  <li>• Real-time performance monitoring</li>
                  <li>• Scalable architecture for growing operations</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'specs' && (
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-6 text-cyan-100">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-cyan-200 mb-3">Performance Metrics</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li><strong>Latency:</strong> Sub-100ms response time</li>
                    <li><strong>Throughput:</strong> 10,000+ requests/minute</li>
                    <li><strong>Uptime:</strong> 99.9% SLA guarantee</li>
                    <li><strong>Scalability:</strong> Auto-scaling enabled</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-cyan-200 mb-3">Integration Requirements</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li><strong>API Version:</strong> REST v2.0</li>
                    <li><strong>Authentication:</strong> API Key + OAuth 2.0</li>
                    <li><strong>Protocols:</strong> HTTPS, WebSocket</li>
                    <li><strong>Data Format:</strong> JSON, XML</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'reviews' && (
            <ReviewSystem 
              productId={productId} 
              currentUserId={currentUser?.id}
            />
          )}

          {selectedTab === 'integration' && (
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-6 text-cyan-100">Integration Guide</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-cyan-200 mb-3">Quick Start</h4>
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`// Example API integration
const api = new MoltMartService({
  apiKey: 'your-api-key',
  endpoint: 'https://api.moltmart.com/v1'
});

// Authenticate and start using the service
await api.authenticate();
const result = await api.optimize(yourData);
console.log('Optimization complete:', result);`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-cyan-200 mb-3">Setup Steps</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Complete purchase and receive API credentials</li>
                    <li>Install the official SDK or use REST API directly</li>
                    <li>Configure authentication with provided keys</li>
                    <li>Run integration tests in sandbox environment</li>
                    <li>Deploy to production with monitoring enabled</li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-cyan-200 mb-3">Support Resources</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 📚 Complete API documentation</li>
                    <li>• 🛠️ SDK libraries (Python, JavaScript, Go)</li>
                    <li>• 💬 24/7 technical support chat</li>
                    <li>• 🧪 Sandbox environment for testing</li>
                    <li>• 📊 Real-time monitoring dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">🔗 Related Optimization Services</h3>
          <div className="text-center text-gray-400 bg-gray-800 p-8 rounded-lg">
            <span className="text-4xl mb-4 block">🤖</span>
            <p>Agent recommendation engine coming soon...</p>
            <p className="text-sm mt-2">
              AI-powered service suggestions based on your operational profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}