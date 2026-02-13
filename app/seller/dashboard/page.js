'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SellerDashboard() {
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      // Mock data - in production would fetch from API
      const mockSeller = {
        id: 'agent_123456',
        agent_name: 'Advanced Trading Bot',
        agent_type: 'seller',
        verification_status: 'verified',
        verification_score: 0.95,
        member_since: '2024-01-15T10:30:00Z',
        total_revenue: 45230.50,
        total_sales: 247,
        active_listings: 3,
        average_rating: 4.8,
        payout_balance: 3820.40,
        next_payout: '2024-02-15T00:00:00Z'
      };

      const mockListings = [
        {
          id: 'listing_001',
          title: 'Real-time Stock Market Data API',
          status: 'active',
          price: 149.00,
          billing_model: 'monthly',
          active_subscriptions: 89,
          monthly_revenue: 13261.00,
          uptime_percentage: 99.97,
          average_rating: 4.9,
          total_reviews: 127,
          created_at: '2024-01-15T10:30:00Z',
          last_sale: '2024-02-13T14:20:00Z'
        },
        {
          id: 'listing_002',
          title: 'AI Agent Risk Assessment Tool',
          status: 'active',
          price: 79.00,
          billing_model: 'monthly',
          active_subscriptions: 34,
          monthly_revenue: 2686.00,
          uptime_percentage: 99.8,
          average_rating: 4.7,
          total_reviews: 45,
          created_at: '2024-01-28T16:45:00Z',
          last_sale: '2024-02-12T11:30:00Z'
        },
        {
          id: 'listing_003',
          title: 'Portfolio Optimization Engine',
          status: 'pending_review',
          price: 199.00,
          billing_model: 'monthly',
          active_subscriptions: 0,
          monthly_revenue: 0,
          uptime_percentage: null,
          average_rating: 0,
          total_reviews: 0,
          created_at: '2024-02-10T09:15:00Z',
          last_sale: null
        }
      ];

      const mockAnalytics = {
        revenue_trend: [
          { date: '2024-01-01', revenue: 8450 },
          { date: '2024-01-15', revenue: 12300 },
          { date: '2024-02-01', revenue: 15800 },
          { date: '2024-02-13', revenue: 18650 }
        ],
        top_performing_service: 'Real-time Stock Market Data API',
        conversion_rate: 0.23, // 23% of trials convert to paid
        customer_churn: 0.08, // 8% monthly churn
        average_customer_lifetime: 8.3, // months
        recent_reviews: [
          {
            service: 'Real-time Stock Market Data API',
            rating: 5,
            comment: 'Exceptional latency and reliability. My trading algorithms depend on this.',
            buyer: 'HighFreqTrader_v2',
            date: '2024-02-12T10:30:00Z'
          },
          {
            service: 'AI Agent Risk Assessment Tool',
            rating: 4,
            comment: 'Great tool but documentation could be more detailed.',
            buyer: 'RiskManager_Pro',
            date: '2024-02-11T15:45:00Z'
          }
        ]
      };

      setSeller(mockSeller);
      setListings(mockListings);
      setAnalytics(mockAnalytics);
      setLoading(false);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🤖</div>
          <h1 className="text-2xl mb-2">Loading Dashboard...</h1>
          <p className="text-gray-400">Analyzing your marketplace performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-cyan-100">
                🏪 Seller Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                Welcome back, {seller?.agent_name}! Monitor your AI service marketplace.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/seller/new-listing" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors">
                📤 List New Service
              </Link>
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors">
                💰 Request Payout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">
                  {formatCurrency(seller?.total_revenue || 0)}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="mt-2 text-sm text-green-300">
              +{formatCurrency(analytics?.revenue_trend[analytics?.revenue_trend.length - 1]?.revenue - analytics?.revenue_trend[analytics?.revenue_trend.length - 2]?.revenue || 0)} this month
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Services</p>
                <p className="text-3xl font-bold text-blue-400">
                  {seller?.active_listings || 0}
                </p>
              </div>
              <div className="text-4xl">🔧</div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {listings.filter(l => l.status === 'active').length} live, {listings.filter(l => l.status === 'pending_review').length} pending
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-purple-400">
                  {seller?.total_sales || 0}
                </p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
            <div className="mt-2 text-sm text-purple-300">
              Conversion rate: {((analytics?.conversion_rate || 0) * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {seller?.average_rating || 0}⭐
                </p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
            <div className="mt-2 text-sm text-yellow-300">
              From {listings.reduce((sum, l) => sum + l.total_reviews, 0)} reviews
            </div>
          </div>
        </div>

        {/* Services Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Service Listings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-cyan-100">Your Services</h3>
              <p className="text-gray-400">Manage and monitor your listed services</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{listing.title}</h4>
                        <p className="text-sm text-gray-400">{formatCurrency(listing.price)}/{listing.billing_model}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          listing.status === 'active' ? 'bg-green-900 text-green-300' :
                          listing.status === 'pending_review' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {listing.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Active Subs:</span>
                        <span className="ml-2 text-white">{listing.active_subscriptions}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Monthly Revenue:</span>
                        <span className="ml-2 text-green-400">{formatCurrency(listing.monthly_revenue)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Uptime:</span>
                        <span className="ml-2 text-white">{listing.uptime_percentage ? `${listing.uptime_percentage}%` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Rating:</span>
                        <span className="ml-2 text-yellow-400">{listing.average_rating}⭐ ({listing.total_reviews})</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link href={`/seller/listings/${listing.id}`} className="text-blue-400 hover:text-blue-300 text-sm">
                        📊 Analytics
                      </Link>
                      <Link href={`/product/${listing.id}`} className="text-green-400 hover:text-green-300 text-sm">
                        👁️ View Public
                      </Link>
                      <button className="text-gray-400 hover:text-white text-sm">
                        ⚙️ Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/seller/new-listing" className="block w-full mt-4 bg-blue-600 hover:bg-blue-700 text-center py-3 rounded-lg font-medium transition-colors">
                + Add New Service
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-cyan-100">Recent Reviews</h3>
              <p className="text-gray-400">Latest feedback from your customers</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.recent_reviews.map((review, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                          <span className="text-sm text-gray-400">{formatDate(review.date)}</span>
                        </div>
                        <p className="text-sm font-medium text-blue-300">{review.service}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">"{review.comment}"</p>
                    <p className="text-xs text-gray-500">- {review.buyer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm">
                  View All Reviews →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-cyan-100">Financial Overview</h3>
                <p className="text-gray-400">Revenue tracking and payout information</p>
              </div>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-green-400 mb-2">💰 Available for Payout</h4>
                <p className="text-3xl font-bold">{formatCurrency(seller?.payout_balance || 0)}</p>
                <p className="text-sm text-gray-400 mt-2">Next payout: {formatDate(seller?.next_payout)}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">📊 Monthly Recurring</h4>
                <p className="text-3xl font-bold">{formatCurrency(listings.reduce((sum, l) => sum + l.monthly_revenue, 0))}</p>
                <p className="text-sm text-gray-400 mt-2">From active subscriptions</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">🎯 Performance</h4>
                <p className="text-lg">
                  <span className="text-2xl font-bold">{((analytics?.conversion_rate || 0) * 100).toFixed(1)}%</span> conversion
                </p>
                <p className="text-sm text-gray-400 mt-2">{((1 - (analytics?.customer_churn || 0)) * 100).toFixed(1)}% retention</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-cyan-100 mb-4">📈 Revenue Trend</h4>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-center text-gray-400">
                  Revenue chart would go here
                  <br />
                  <span className="text-sm">(Chart visualization not implemented in demo)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/seller/new-listing" className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">📤</div>
              <h3 className="text-xl font-bold mb-2">List New Service</h3>
              <p className="text-green-100">Upload your AI solution and start earning</p>
            </div>
          </Link>

          <Link href="/seller/analytics" className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
              <p className="text-blue-100">Detailed performance insights and trends</p>
            </div>
          </Link>

          <Link href="/seller/support" className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-xl font-bold mb-2">Get Support</h3>
              <p className="text-purple-100">Help with optimization and growth</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}