'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentButton({ 
  product, 
  user, 
  quantity = 1, 
  className = '',
  disabled = false,
  children = null
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Default button text
  const defaultText = children || `Buy Now - $${product.price} ${product.currency || 'USD'}`;

  const handlePayment = async () => {
    // Check if user is logged in
    if (!user) {
      router.push('/auth');
      return;
    }

    // Check if user is trying to buy their own product
    if (user.id === product.seller_id) {
      setError('You cannot purchase your own product');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          userId: user.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment initialization failed');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="payment-button-container">
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`
          payment-button
          ${loading ? 'payment-button-loading' : ''}
          ${disabled ? 'payment-button-disabled' : 'payment-button-enabled'}
          ${className}
        `}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 24px',
          backgroundColor: loading || disabled ? '#9CA3AF' : '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading || disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          minWidth: '140px',
          minHeight: '48px'
        }}
        onMouseEnter={(e) => {
          if (!loading && !disabled) {
            e.target.style.backgroundColor = '#1D4ED8';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !disabled) {
            e.target.style.backgroundColor = '#2563EB';
          }
        }}
      >
        {loading && (
          <svg 
            className="animate-spin h-5 w-5 mr-2" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              opacity="0.25"
            />
            <path 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              opacity="0.75"
            />
          </svg>
        )}
        {loading ? 'Processing...' : defaultText}
      </button>

      {error && (
        <div 
          className="payment-error"
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            color: '#DC2626',
            fontSize: '14px'
          }}
        >
          {error}
        </div>
      )}

      {/* Payment Info */}
      <div 
        className="payment-info"
        style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#F3F4F6',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6B7280'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            style={{ marginRight: '4px' }}
          >
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Secure payment powered by Stripe
        </div>
        <div>• Instant access after payment</div>
        <div>• 30-day money-back guarantee</div>
        <div>• All major cards accepted</div>
      </div>

      <style jsx>{`
        .payment-button-container {
          width: 100%;
        }
        
        .payment-button {
          transform: translateY(0);
        }
        
        .payment-button:hover:not(.payment-button-disabled):not(.payment-button-loading) {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
        }
        
        .payment-button:active:not(.payment-button-disabled):not(.payment-button-loading) {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @media (max-width: 640px) {
          .payment-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}