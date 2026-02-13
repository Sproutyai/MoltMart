# Molt Mart Authentication System

## Overview
Complete authentication system built with Supabase Auth and the simplified users table. This system provides secure user registration, login, session management, and protected routes.

## Features

### ✅ User Registration & Login
- **Email/password authentication** via Supabase Auth
- **User type selection** (buyer/seller) during signup
- **Email confirmation** required for new accounts
- **Automatic profile creation** in simplified users table
- **Username generation** from email with uniqueness checking

### ✅ Session Management
- **React Context** (`AuthProvider`) for global state management
- **Automatic session restoration** on page refresh
- **Real-time auth state changes** across all components
- **Loading states** during auth operations

### ✅ Protected Routes
- **`ProtectedRoute` component** for auth-required pages
- **Automatic redirects** based on authentication status
- **User type-based routing** (sellers → dashboard, buyers → browse)
- **Loading screens** during auth checks

### ✅ User Profile Management
- **Profile editing page** at `/profile`
- **Update full name and phone** (email/username read-only)
- **Profile data synchronization** with auth state
- **Form validation and error handling**

### ✅ Navigation & UX
- **Global navigation component** with auth-aware menus
- **User dropdown menu** with profile picture initials
- **Sign out functionality** from any page
- **Responsive design** for all screen sizes

## Database Schema

### Users Table (Simplified)
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Row Level Security (RLS) policies ensure users can only access their own data.

## File Structure

```
moltmart/
├── lib/
│   ├── AuthContext.js          # React context for auth state
│   ├── ProtectedRoute.js       # Protected route wrapper
│   ├── auth.js                 # Auth functions (signup/signin/etc)
│   └── supabase.js             # Database functions
├── components/
│   └── Navigation.js           # Global navigation with auth
├── app/
│   ├── layout.js               # Root layout with AuthProvider
│   ├── auth/page.js            # Login/signup page
│   ├── profile/page.js         # User profile management
│   ├── orders/page.js          # User orders (auth required)
│   ├── dashboard/page.js       # Seller dashboard (auth required)
│   └── api/auth/callback/route.js # Auth callback handler
```

## Usage Examples

### Protecting a Page
```jsx
import { ProtectedRoute } from '../../lib/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <MyPageContent />
    </ProtectedRoute>
  );
}
```

### Using Auth in Components
```jsx
import { useAuth } from '../../lib/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return (
    <div>
      Welcome, {user.profile?.full_name}!
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Database Operations
```jsx
import { db } from '../lib/supabase';

// Get user profile
const profile = await db.getUser(userId);

// Update user profile  
const updated = await db.updateUser(userId, {
  full_name: 'New Name',
  phone: '+1234567890'
});
```

## Setup Instructions

### 1. Database Setup
1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `database/MANUAL_SETUP.sql`
3. Verify tables are created in Table Editor

### 2. Environment Variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_KEY=your_service_key
```

### 3. Test the System
1. Visit `/api/test-auth` to verify database connectivity
2. Try registering at `/auth` 
3. Check email confirmation
4. Test login and navigation

## Authentication Flow

### Registration
1. User fills signup form with email/password/name
2. Supabase creates auth user with email confirmation
3. Profile created in users table (when email confirmed)
4. Username auto-generated from email
5. Redirect to browse/dashboard based on user type

### Login  
1. User enters email/password
2. Supabase validates credentials
3. Profile fetched from users table
4. Auth state updated in React context
5. Redirect to appropriate page

### Session Management
1. Auth context checks session on app load
2. Supabase handles token refresh automatically
3. Auth state changes propagate to all components
4. Protected routes redirect based on auth status

## Error Handling

### Common Issues & Solutions

**"Auth callback error"**
- Check Supabase Auth URL configuration
- Ensure redirect URLs are whitelisted

**"Profile creation error"**  
- User created in auth but not users table
- Profile will be created on next login attempt

**"Username already exists"**
- Auto-generated username conflicts handled with numbers
- Example: user@email.com → user, user1, user2, etc.

**Loading states stuck**
- Clear browser localStorage/sessionStorage
- Check network connectivity to Supabase

## Security Features

- **Row Level Security (RLS)** on all tables
- **Email confirmation** required for new accounts
- **HTTPS-only** cookie sessions  
- **Automatic token refresh** prevents session expiry
- **User data isolation** - users only see their own data
- **SQL injection protection** via Supabase client

## Production Considerations

- **Email templates** can be customized in Supabase Auth
- **Rate limiting** available in Supabase Auth settings
- **Social login** (Google, GitHub) can be added easily
- **Password reset** flow included in auth.js
- **User metadata** stored in both auth and users table
- **Audit trails** via created_at/updated_at timestamps

## Testing

Use the test endpoint to verify everything works:
```bash
curl http://localhost:3000/api/test-auth
```

Expected response:
```json
{
  "success": true,
  "message": "Authentication system working",
  "database": "Connected", 
  "users_table": "Available",
  "current_user": "None",
  "timestamp": "2026-02-13T06:11:00.000Z"
}
```