import { supabase, db } from './supabase'

export const auth = {
  // Sign up with email and password
  async signUp(email, password, userData) {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            user_type: userData.userType
          }
        }
      })

      if (signUpError) throw signUpError

      // Create user profile in our custom table (if user was created)
      if (authData.user && !authData.user.email_confirmed_at) {
        try {
          // Generate username from email
          const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
          let finalUsername = username
          let counter = 1
          
          // Check for username uniqueness
          while (true) {
            const { data: existingUser } = await supabase
              .from('users')
              .select('username')
              .eq('username', finalUsername)
              .single()
            
            if (!existingUser) break
            finalUsername = `${username}${counter}`
            counter++
          }

          await db.createUser({
            id: authData.user.id,
            email: authData.user.email,
            username: finalUsername,
            full_name: userData.name,
            phone: null
          })
        } catch (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw here - user is created in auth, profile can be created later
        }
      }

      return authData
    } catch (error) {
      console.error('SignUp error:', error)
      throw error
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Ensure user profile exists
      if (data.user) {
        try {
          const existingUser = await db.getUser(data.user.id)
          
          // Create profile if it doesn't exist (for users created before our system)
          if (!existingUser) {
            const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
            await db.createUser({
              id: data.user.id,
              email: data.user.email,
              username: username,
              full_name: data.user.user_metadata?.full_name || 'User',
              phone: null
            })
          }
        } catch (profileError) {
          console.error('Profile check/creation error:', profileError)
        }
      }

      return data
    } catch (error) {
      console.error('SignIn error:', error)
      throw error
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('SignOut error:', error)
      throw error
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('GetSession error:', error)
      throw error
    }
  },

  // Get current user with profile
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      
      if (user) {
        try {
          const profile = await db.getUser(user.id)
          return { ...user, profile }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError)
          return user
        }
      }
      
      return null
    } catch (error) {
      console.error('GetCurrentUser error:', error)
      throw error
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      return await db.updateUser(userId, updates)
    } catch (error) {
      console.error('UpdateProfile error:', error)
      throw error
    }
  }
}