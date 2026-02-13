'use client';

import { useState, useEffect } from 'react';
import { supabase, db } from '../lib/supabase';

export default function ProfileManager({ user, profile: initialProfile, onUpdate }) {
  const [profile, setProfile] = useState(initialProfile || {});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website_url: '',
    twitter_handle: '',
    github_handle: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setFormData({
        name: initialProfile.name || '',
        bio: initialProfile.bio || '',
        website_url: initialProfile.website_url || '',
        twitter_handle: initialProfile.twitter_handle || '',
        github_handle: initialProfile.github_handle || '',
        avatar_url: initialProfile.avatar_url || ''
      });
    } else if (user) {
      loadProfile();
    }
  }, [user, initialProfile]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profileData = await db.getUser(user.id);
      if (profileData) {
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          bio: profileData.bio || '',
          website_url: profileData.website_url || '',
          twitter_handle: profileData.twitter_handle || '',
          github_handle: profileData.github_handle || '',
          avatar_url: profileData.avatar_url || ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      // Clean up social handles (remove @ symbols and URLs)
      const cleanFormData = {
        ...formData,
        twitter_handle: formData.twitter_handle.replace(/^@/, '').replace('https://twitter.com/', ''),
        github_handle: formData.github_handle.replace(/^@/, '').replace('https://github.com/', ''),
        website_url: formData.website_url && !formData.website_url.startsWith('http') 
          ? `https://${formData.website_url}` 
          : formData.website_url
      };

      const updatedProfile = await db.updateUser(user.id, cleanFormData);
      setProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      if (onUpdate) {
        onUpdate(updatedProfile);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setFormData({
      name: profile.name || '',
      bio: profile.bio || '',
      website_url: profile.website_url || '',
      twitter_handle: profile.twitter_handle || '',
      github_handle: profile.github_handle || '',
      avatar_url: profile.avatar_url || ''
    });
    setMessage({ type: '', text: '' });
  };

  const isFormChanged = () => {
    return Object.keys(formData).some(key => formData[key] !== (profile[key] || ''));
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gap: '2rem',
      maxWidth: '800px'
    }}>
      {/* Profile Header */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: formData.avatar_url 
              ? `url(${formData.avatar_url}) center/cover` 
              : '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#6b7280'
          }}>
            {!formData.avatar_url && '👤'}
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>
              {formData.name || 'Your Name'}
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {user?.email}
            </p>
            <p style={{ color: '#9ca3af', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
              Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            border: message.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
            color: message.type === 'success' ? '#065f46' : '#dc2626'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{
            display: 'grid',
            gap: '1.5rem'
          }}>
            {/* Basic Information */}
            <div>
              <h3 style={{ margin: '0 0 1rem', color: '#374151' }}>Basic Information</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      background: '#f9fafb',
                      color: '#6b7280'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Tell us about yourself, your interests, or what you're looking for on Molt Mart..."
              />
            </div>

            {/* Social Links */}
            <div>
              <h3 style={{ margin: '0 0 1rem', color: '#374151' }}>Social Links</h3>
              
              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Twitter Handle
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        fontSize: '1rem'
                      }}>
                        @
                      </span>
                      <input
                        type="text"
                        value={formData.twitter_handle}
                        onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      GitHub Handle
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280',
                        fontSize: '1rem'
                      }}>
                        @
                      </span>
                      <input
                        type="text"
                        value={formData.github_handle}
                        onChange={(e) => handleInputChange('github_handle', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 0.75rem 0.75rem 2rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '1rem'
                        }}
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Avatar Image URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="https://example.com/avatar.jpg"
              />
              <p style={{
                color: '#6b7280',
                fontSize: '0.8rem',
                margin: '0.5rem 0 0'
              }}>
                Enter a direct URL to your profile picture
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                type="submit"
                disabled={saving || !isFormChanged()}
                style={{
                  background: saving || !isFormChanged() ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving || !isFormChanged() ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || !isFormChanged()}
                style={{
                  background: 'transparent',
                  color: '#6b7280',
                  padding: '0.75rem 2rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: saving || !isFormChanged() ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Account Settings */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 1.5rem', color: '#374151' }}>Account Settings</h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', color: '#374151' }}>Email Notifications</h4>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                Receive updates about your orders and account
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              style={{ transform: 'scale(1.2)' }}
            />
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', color: '#374151' }}>Marketing Emails</h4>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                Get product recommendations and special offers
              </p>
            </div>
            <input
              type="checkbox"
              style={{ transform: 'scale(1.2)' }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', color: '#374151' }}>Wishlist Notifications</h4>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                Get notified when wishlist items go on sale
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              style={{ transform: 'scale(1.2)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}