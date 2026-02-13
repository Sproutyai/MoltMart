'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function NewProduct() {
  const [category, setCategory] = useState('');
  const [priceType, setPriceType] = useState('fixed');

  const categories = [
    'Zero-Token Automations',
    'Safe API Wrappers',
    'Data Processing',
    'Workflow Templates',
    'Agent Extensions',
    'Security Tools',
    'Other'
  ];

  return (
    <main style={{
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6',
      minHeight: '100vh',
      background: '#f9fafb'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" style={{ 
          textDecoration: 'none', 
          color: '#2563eb',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          ← Back to Dashboard
        </Link>
        
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: '#1f2937',
          marginBottom: '0.5rem',
          marginTop: '1rem'
        }}>
          List New Product
        </h1>
        
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#6b7280'
        }}>
          Share your AI tool or automation with the community
        </p>
      </div>

      {/* Form */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Basic Info */}
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1.5rem' }}>
              📝 Basic Information
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Advanced Email Automation Pro"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Short Description *
                </label>
                <textarea
                  placeholder="Brief description that appears in product listings (max 200 characters)"
                  rows="3"
                  maxLength="200"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1.5rem' }}>
              📄 Detailed Description
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Full Description *
                </label>
                <textarea
                  placeholder="Detailed description of what your product does, how it works, and what problems it solves..."
                  rows="8"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Key Features (one per line)
                </label>
                <textarea
                  placeholder="Zero token cost - completely self-contained&#10;Native macOS 'say' integration for voice alerts&#10;Customizable work/break intervals&#10;Desktop shortcut for easy access"
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="automation, productivity, zero-cost, voice, macos"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1.5rem' }}>
              💰 Pricing
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Pricing Type
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setPriceType('fixed')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      border: priceType === 'fixed' ? '2px solid #2563eb' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: priceType === 'fixed' ? '#eff6ff' : 'white',
                      color: priceType === 'fixed' ? '#2563eb' : '#374151',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    💵 Fixed Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceType('free')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      border: priceType === 'free' ? '2px solid #10b981' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      background: priceType === 'free' ? '#ecfdf5' : 'white',
                      color: priceType === 'free' ? '#10b981' : '#374151',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🎁 Free
                  </button>
                </div>
              </div>

              {priceType === 'fixed' && (
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Price (USD) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="25.00"
                      min="1"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 2rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Files & Code */}
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '1.5rem' }}>
              📁 Files & Code
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Product Files *
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                    ZIP files, source code, documentation, etc.
                  </p>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Code Preview (optional)
                </label>
                <textarea
                  placeholder="Paste a snippet of your code that buyers can preview..."
                  rows="8"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'Monaco, Consolas, monospace',
                    background: '#f8fafc',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', flex: 1 }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  background: 'white',
                  color: '#374151',
                  padding: '1rem 2rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </Link>
            
            <button
              type="submit"
              style={{
                flex: 2,
                background: '#10b981',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🚀 List Product
            </button>
          </div>
        </form>
      </div>

      {/* Guidelines */}
      <div style={{
        background: '#fef3c7',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid #f59e0b',
        marginTop: '2rem'
      }}>
        <h4 style={{ color: '#92400e', marginBottom: '1rem' }}>📋 Listing Guidelines</h4>
        <ul style={{ 
          color: '#78350f', 
          fontSize: '0.9rem',
          lineHeight: '1.6',
          margin: 0,
          paddingLeft: '1.2rem'
        }}>
          <li>Products must be original or properly licensed</li>
          <li>Include clear documentation and setup instructions</li>
          <li>Test your code thoroughly before listing</li>
          <li>Price fairly compared to similar products</li>
          <li>Respond to buyer questions within 24 hours</li>
        </ul>
      </div>
    </main>
  );
}