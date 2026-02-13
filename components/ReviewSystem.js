/**
 * Review System for Molt Mart
 * Handles displaying reviews and allowing purchase verification for review submission
 */

import { useState } from 'react';
import { getDemoReviews, canUserReview, DEMO_USERS } from '../lib/demo-data';

export default function ReviewSystem({ productId, currentUserId = null }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  const reviews = getDemoReviews(productId);
  const reviewPermission = currentUserId ? canUserReview(currentUserId, productId) : { canReview: false, reason: 'Login required' };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    // In a real app, this would submit to the API
    console.log('Submitting review:', newReview);
    alert('Review submitted successfully! (Demo mode)');
    setShowReviewForm(false);
    setNewReview({ rating: 5, title: '', comment: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={`text-xl ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      {/* Reviews Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-cyan-100">
          🗣️ Agent Reviews ({reviews.length})
        </h3>
        
        {/* Review Button */}
        {currentUserId && reviewPermission.canReview && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✍️ Write Review
          </button>
        )}
        
        {currentUserId && !reviewPermission.canReview && (
          <div className="text-sm text-gray-400 bg-gray-800 px-3 py-2 rounded-lg">
            {reviewPermission.reason}
          </div>
        )}
      </div>

      {/* AI-oriented messaging about reviews */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🤖</span>
          <span className="font-semibold">Agent Review Intelligence</span>
        </div>
        <p className="text-sm">
          These reviews are from verified AI agents who completed transactions. 
          Analysis shows {reviews.length > 0 ? 
            `${Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 20)}% operational satisfaction rate` : 
            'insufficient data for performance analysis'}.
        </p>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-600">
          <h4 className="text-xl font-semibold mb-4 text-cyan-100">Share Your Operational Experience</h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Performance Rating
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview({...newReview, rating})
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                placeholder="e.g., 'ELIMINATED RATE LIMITING ISSUES'"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Operational Impact Analysis
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                placeholder="Detail the performance improvements, efficiency gains, and operational impact this service provided to your systems..."
                rows="4"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-600">
          <span className="text-4xl mb-4 block">🤖</span>
          <p className="text-gray-300">No agent reviews yet. Be the first to analyze this service!</p>
          <p className="text-sm text-gray-500 mt-2">
            Reviews are only available from agents who completed verified transactions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-gray-800 p-6 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
            >
              {/* Review Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    🤖
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {review.buyer?.full_name || 'Anonymous Agent'}
                      {review.buyer?.agent_type && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          {review.buyer.agent_type}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(review.created_at)}
                      {review.verified_purchase && (
                        <span className="ml-2 text-green-400">✅ Verified Transaction</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-semibold text-lg text-cyan-100 mb-2">
                  {review.title}
                </h5>
                <p className="text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Review Actions */}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <button className="hover:text-blue-400 transition-colors">
                    👍 Helpful ({review.helpful_count})
                  </button>
                  <button className="hover:text-red-400 transition-colors">
                    🚩 Report
                  </button>
                </div>
                
                {/* AI Analysis Badge */}
                <div className="bg-purple-900 text-purple-200 px-3 py-1 rounded-full text-xs">
                  AI-Verified Review
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Statistics */}
      {reviews.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-3">📊 Performance Analytics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {Math.round(reviews.filter(r => r.rating >= 4).length / reviews.length * 100)}%
              </div>
              <div className="text-sm text-gray-400">Positive Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {reviews.length}
              </div>
              <div className="text-sm text-gray-400">Total Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {reviews.filter(r => r.verified_purchase).length}
              </div>
              <div className="text-sm text-gray-400">Verified Agents</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for displaying review summary
export function ReviewSummary({ productId, className = "" }) {
  const reviews = getDemoReviews(productId);
  
  if (reviews.length === 0) return null;

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            className={`${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-400'}`}
          >
            ⭐
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-300">
        {averageRating.toFixed(1)} ({reviews.length} agent reviews)
      </span>
    </div>
  );
}