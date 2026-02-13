'use client';

import { useState } from 'react';

export default function OrderTracker({ purchase, onUpdate }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#ecfdf5', color: '#047857', border: '#10b981', progress: '#10b981' };
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b', progress: '#f59e0b' };
      case 'failed':
        return { bg: '#fef2f2', color: '#dc2626', border: '#ef4444', progress: '#ef4444' };
      case 'refunded':
        return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af', progress: '#9ca3af' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db', progress: '#d1d5db' };
    }
  };

  const getStatusSteps = (status) => {
    const steps = [
      { 
        key: 'pending', 
        label: 'Order Placed', 
        description: 'Your order has been received',
        icon: '📝' 
      },
      { 
        key: 'processing', 
        label: 'Processing', 
        description: 'Preparing your digital product',
        icon: '⚙️' 
      },
      { 
        key: 'completed', 
        label: 'Ready to Download', 
        description: 'Your product is ready for access',
        icon: '✅' 
      }
    ];

    const currentIndex = steps.findIndex(step => step.key === status);
    
    return steps.map((step, index) => ({
      ...step,
      status: index <= currentIndex ? 'completed' : 
              index === currentIndex + 1 ? 'current' : 'upcoming'
    }));
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 33;
      case 'processing': return 66;
      case 'completed': return 100;
      case 'failed': return 0;
      case 'refunded': return 0;
      default: return 0;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusColors = getStatusColor(purchase.status);
  const steps = getStatusSteps(purchase.status);
  const progressPercentage = getProgressPercentage(purchase.status);

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '1rem'
    }}>
      {/* Order Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '1rem',
        cursor: 'pointer'
      }} onClick={() => setExpanded(!expanded)}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 0.5rem', 
            color: '#1f2937',
            fontSize: '1.2rem' 
          }}>
            {purchase.product?.title || 'Product'}
          </h3>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <p style={{ 
              color: '#6b7280', 
              margin: 0, 
              fontSize: '0.9rem' 
            }}>
              Order #{purchase.id.slice(-8).toUpperCase()}
            </p>
            <p style={{ 
              color: '#9ca3af', 
              margin: 0, 
              fontSize: '0.8rem' 
            }}>
              {formatDate(purchase.created_at)}
            </p>
            {purchase.tracking_number && (
              <p style={{ 
                color: '#2563eb', 
                margin: 0, 
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                Tracking: {purchase.tracking_number}
              </p>
            )}
          </div>
        </div>
        
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              ${purchase.amount}
            </div>
            <span style={{
              background: statusColors.bg,
              color: statusColors.color,
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              border: `1px solid ${statusColors.border}`
            }}>
              {purchase.status === 'completed' ? '✅ Completed' :
               purchase.status === 'pending' ? '⏳ Pending' :
               purchase.status === 'processing' ? '⚙️ Processing' :
               purchase.status === 'failed' ? '❌ Failed' :
               purchase.status === 'refunded' ? '↩️ Refunded' : 
               purchase.status}
            </span>
          </div>
          
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#6b7280',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>
            ▼
          </button>
        </div>
      </div>

      {/* Quick Progress Bar */}
      <div style={{
        marginBottom: expanded ? '1.5rem' : '0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>
            Order Progress
          </span>
          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {progressPercentage}%
          </span>
        </div>
        
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: statusColors.progress,
            borderRadius: '4px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
          {/* Detailed Status Steps */}
          <div style={{
            display: 'flex',
            position: 'relative',
            marginBottom: '2rem'
          }}>
            {/* Progress Line */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              height: '2px',
              background: '#e5e7eb',
              zIndex: 1
            }}>
              <div style={{
                height: '100%',
                width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`,
                background: statusColors.progress,
                transition: 'width 0.5s ease'
              }} />
            </div>

            {steps.map((step, index) => (
              <div key={step.key} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: step.status === 'completed' ? statusColors.progress : 
                             step.status === 'current' ? '#fff' : '#f3f4f6',
                  border: step.status === 'current' ? `3px solid ${statusColors.progress}` : 
                         step.status === 'completed' ? 'none' : '2px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  marginBottom: '0.5rem'
                }}>
                  {step.status === 'completed' ? '✅' : step.icon}
                </div>
                
                <h4 style={{
                  margin: '0 0 0.25rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: step.status === 'completed' || step.status === 'current' ? 
                         '#374151' : '#9ca3af',
                  textAlign: 'center'
                }}>
                  {step.label}
                </h4>
                
                <p style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  maxWidth: '120px',
                  lineHeight: '1.3'
                }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Product Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <h5 style={{ margin: '0 0 0.5rem', color: '#374151' }}>Product Details</h5>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
                <strong>Category:</strong> {purchase.product?.category}
              </p>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
                <strong>Seller:</strong> {purchase.product?.seller?.name}
              </p>
            </div>

            {purchase.estimated_delivery && (
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <h5 style={{ margin: '0 0 0.5rem', color: '#374151' }}>Delivery Info</h5>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#6b7280' }}>
                  <strong>Estimated:</strong> {formatDate(purchase.estimated_delivery)}
                </p>
                {purchase.delivered_at && (
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#10b981' }}>
                    <strong>Delivered:</strong> {formatDate(purchase.delivered_at)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            flexWrap: 'wrap',
            borderTop: '1px solid #f3f4f6',
            paddingTop: '1rem'
          }}>
            {purchase.status === 'completed' && purchase.product?.file_url && (
              <a 
                href={purchase.product.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📥 Download Product
                </button>
              </a>
            )}

            <button style={{
              background: '#f3f4f6',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📧 Contact Seller
            </button>

            {purchase.status === 'completed' && !purchase.reviewed && (
              <button style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '0.75rem 1.5rem',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⭐ Write Review
              </button>
            )}

            {(purchase.status === 'pending' || purchase.status === 'processing') && (
              <button style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '0.75rem 1.5rem',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ❌ Cancel Order
              </button>
            )}

            {purchase.status === 'failed' && (
              <button style={{
                background: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔄 Retry Purchase
              </button>
            )}
          </div>

          {/* Order Notes */}
          {purchase.buyer_notes && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #f59e0b'
            }}>
              <h5 style={{ margin: '0 0 0.5rem', color: '#92400e' }}>Your Notes</h5>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f' }}>
                {purchase.buyer_notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}