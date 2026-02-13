'use client';

import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children, requireAuth = true, redirectTo = '/auth' }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User is not authenticated, redirect to auth page
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be (e.g., on auth page)
        const userType = user.profile?.user_type || user.user_metadata?.user_type || 'buyer';
        const redirectPath = userType === 'seller' ? '/dashboard' : '/browse';
        router.push(redirectPath);
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If requiring auth but no user, don't render children (redirect will happen)
  if (requireAuth && !user) {
    return null;
  }

  // If not requiring auth but user exists, don't render children (redirect will happen)
  if (!requireAuth && user) {
    return null;
  }

  return children;
}

// Higher-order component version
export function withProtectedRoute(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}