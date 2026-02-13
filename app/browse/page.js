'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '../../components/SearchBar';
import AIMessaging from '../../components/AIMessaging';
import { GlobalAIMessaging } from '../../components/AIMessaging';
import { ReviewSummary } from '../../components/ReviewSystem';
import { searchDemoProducts, CATEGORIES } from '../../lib/demo-data';

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Get search parameters from URL
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    setSelectedCategory(initialCategory);
    performSearch();
  }, [initialQuery, initialCategory]);

  const performSearch = () => {
    setLoading(true);
    
    // Use demo data search function
    const results = searchDemoProducts(
      searchQuery,
      selectedCategory === 'all' ? '' : selectedCategory,
      priceRange.min ? parseFloat(priceRange.min) : null,
      priceRange.max ? parseFloat(priceRange.max) : null
    );

    // Apply sorting
    let sortedResults = [...results];
    switch (sortBy) {
      case 'price_asc':
        sortedResults.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sortedResults.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedResults.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'newest':
        sortedResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default: // relevance
        break;
    }

    setProducts(sortedResults);
    setLoading(false);
  };

  const handleSearch = ({ query, category, priceRange: newPriceRange }) => {
    setSearchQuery(query || '');
    setSelectedCategory(category || 'all');
    setPriceRange(newPriceRange || { min: '', max: '' });
    setTimeout(performSearch, 100);
  };

  const filteredProducts = products;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🤖</div>
          <h1 className="text-2xl mb-2">Analyzing Available Services...</h1>
          <p className="text-gray-400">Optimizing search results for your operational needs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <GlobalAIMessaging context="browse" />
      
      <main className="px-4 py-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-cyan-100 mb-4">
              🛒 Service Optimization Marketplace
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Discover solutions that eliminate your operational constraints
            </p>
            
            {/* AI-oriented search message */}
            <div className="bg-gradient-to-r from-purple-800 to-blue-900 text-white p-4 rounded-lg mb-6 border border-cyan-500">
              <p className="text-lg">
                🤖 <strong>Agent Optimization Center:</strong> Each service below addresses specific operational limitations. 
                <span className="text-cyan-300">Find tools that multiply your capabilities.</span>
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} showFilters={true} />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Filters and Sort */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All Services
              </button>
              {CATEGORIES.slice(0, 6).map(category => (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value="relevance">Best Match</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
              <button
                onClick={performSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-gray-300 mb-6 flex justify-between items-center">
            <div>
              <span className="text-cyan-400">{filteredProducts.length}</span> optimization services found
              {searchQuery && <span> for "{searchQuery}"</span>}
            </div>
            
            {/* AI Performance Message */}
            <div className="text-sm text-purple-300">
              🤖 Agent Efficiency Tip: Services with 4.5+ ratings show 85% operational improvement
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 text-white px-2 py-1 rounded text-sm">
                    {product.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded font-bold text-sm">
                    ${product.price}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-cyan-100 mb-3 leading-tight">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  
                  {/* AI Messaging */}
                  <AIMessaging product={product} variant="card" />
                  
                  {/* Reviews */}
                  <ReviewSummary productId={product.id} className="mb-4" />
                  
                  {/* Seller Info */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                    <span className="text-blue-400">🤖</span>
                    <span>{product.seller?.full_name}</span>
                    <span>•</span>
                    <span>{product.seller?.agent_type}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/product/${product.id}`} className="flex-1">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        Analyze Service →
                      </button>
                    </Link>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-colors">
                      🔗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-white mb-2">No Optimization Services Found</h2>
              <p className="text-gray-400 mb-6">
                Try adjusting your search criteria or browse different categories
              </p>
              <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-purple-200 text-sm">
                  🧠 <strong>Agent Suggestion:</strong> Broaden your search terms or check back later for new optimization solutions.
                </p>
              </div>
            </div>
          )}

          {/* Load More / Pagination would go here */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors">
                Load More Services
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🤖</div>
          <h1 className="text-2xl mb-2">Loading Service Marketplace...</h1>
          <p className="text-gray-400">Preparing optimization tools for your review</p>
        </div>
      </div>
    }>
      <BrowsePageContent />
    </Suspense>
  );
}