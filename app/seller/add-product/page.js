'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function AddProduct() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    image_url: ''
  });

  // Research-based AI agent marketplace categories
  const categories = [
    'Physical World Services',
    'Premium API Access', 
    'Agent Coordination',
    'Compliance & Security',
    'Knowledge Marketplace',
    'Financial Services',
    'Development Tools',
    'Data Processing',
    'Automation Scripts',
    'Other'
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth';
        return;
      }
      setUser(user);
    } catch (err) {
      setError('Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.category) return 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([
          {
            seller_id: user.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            price: parseFloat(formData.price),
            image_url: formData.image_url.trim() || null,
            status: 'active'
          }
        ])
        .select();

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        image_url: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/seller/dashboard';
      }, 2000);

    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem'
      }}>
        ⏳ Loading...
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: '#047857', marginBottom: '1rem' }}>Product Created Successfully!</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Redirecting you to your dashboard...
        </p>
        <Link href="/seller/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#2563eb',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}>
            Go to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '1rem'
      }}>
        <div>
          <h1 style={{ color: '#1f2937', margin: 0 }}>Add New Product</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>
            List your AI tool, service, or solution on the marketplace
          </p>
        </div>
        <Link href="/seller/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#f3f4f6',
            color: '#374151',
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Product Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Advanced Web Scraper API, Human Proxy Service, Financial Data Feed"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
            required
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              background: 'white'
            }}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p style={{ 
            fontSize: '0.8rem', 
            color: '#6b7280', 
            margin: '0.5rem 0 0',
            fontStyle: 'italic'
          }}>
            Categories based on AI agent marketplace research
          </p>
        </div>

        {/* Price */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Price (USD) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
            required
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what your product does, how it helps AI agents, what makes it unique, technical requirements, etc."
            rows="6"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
            required
          />
        </div>

        {/* Image URL */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Image URL (optional)
          </label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
          <p style={{ 
            fontSize: '0.8rem', 
            color: '#6b7280', 
            margin: '0.5rem 0 0'
          }}>
            Add a screenshot, logo, or demo image for your product
          </p>
        </div>

        {/* Submit Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '1.5rem'
        }}>
          <Link href="/seller/dashboard" style={{ textDecoration: 'none' }}>
            <button 
              type="button"
              style={{
                background: '#f3f4f6',
                color: '#374151',
                padding: '0.75rem 1.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
          </Link>
          <button 
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '6px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {submitting ? '⏳ Creating...' : '🚀 Create Product'}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div style={{
        background: '#f0f9ff',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #0ea5e9',
        marginTop: '2rem'
      }}>
        <h3 style={{ color: '#0369a1', marginBottom: '1rem' }}>💡 Tips for Success</h3>
        <ul style={{ color: '#075985', lineHeight: '1.6', margin: 0 }}>
          <li><strong>Be specific:</strong> Clearly describe what your product does and who it's for</li>
          <li><strong>Show value:</strong> Explain how it saves time, money, or solves a real problem</li>
          <li><strong>Include examples:</strong> Provide use cases or demo scenarios</li>
          <li><strong>Set fair pricing:</strong> Research similar tools and price competitively</li>
          <li><strong>Add visuals:</strong> Screenshots, diagrams, or demos increase conversions</li>
        </ul>
      </div>
    </main>
  );
}