'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { ProtectedRoute } from '../../lib/ProtectedRoute';
import Navigation from '../../components/Navigation';

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    phone: '',
    email: ''
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        full_name: user.profile.full_name || '',
        username: user.profile.username || '',
        phone: user.profile.phone || '',
        email: user.profile.email || user.email || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Only update fields that can be changed
      const updateData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || null
      };

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const userType = user?.profile?.user_type || user?.user_metadata?.user_type || 'buyer';
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navigation />
      
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#2563eb',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1rem',
            fontWeight: 'bold'
          }}>
            {formData.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            {formData.full_name || 'User'}
          </h1>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: '#6b7280',
            fontSize: '0.9rem'
          }}>
            <span style={{
              background: userType === 'seller' ? '#ecfdf5' : '#eff6ff',
              color: userType === 'seller' ? '#10b981' : '#2563eb',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {userType}
            </span>
            <span>•</span>
            <span>Joined {joinDate}</span>
          </div>
        </div>

        {/* Profile Form */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#1f2937',
              margin: 0
            }}>
              Profile Information
            </h2>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #f87171',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ color: '#dc2626', margin: 0, fontSize: '0.9rem' }}>
                {error}
              </p>
            </div>
          )}

          {success && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ color: '#0369a1', margin: 0, fontSize: '0.9rem' }}>
                {success}
              </p>
            </div>
          )}

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSubmit} style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Read-only fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    Email (Read-only)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      background: '#f9fafb',
                      color: '#6b7280',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    Username (Read-only)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      background: '#f9fafb',
                      color: '#6b7280',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    setSuccess('');
                    // Reset form to original values
                    if (user?.profile) {
                      setFormData({
                        full_name: user.profile.full_name || '',
                        username: user.profile.username || '',
                        phone: user.profile.phone || '',
                        email: user.profile.email || user.email || ''
                      });
                    }
                  }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#374151',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    Full Name
                  </label>
                  <p style={{
                    margin: 0,
                    padding: '0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#1f2937'
                  }}>
                    {formData.full_name || 'Not specified'}
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    Phone Number
                  </label>
                  <p style={{
                    margin: 0,
                    padding: '0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#1f2937'
                  }}>
                    {formData.phone || 'Not specified'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    Email
                  </label>
                  <p style={{
                    margin: 0,
                    padding: '0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#1f2937'
                  }}>
                    {formData.email}
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    Username
                  </label>
                  <p style={{
                    margin: 0,
                    padding: '0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#1f2937'
                  }}>
                    @{formData.username}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfilePage />
    </ProtectedRoute>
  );
}