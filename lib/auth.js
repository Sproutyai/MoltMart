import { supabase, db } from './supabase'

export const auth = {
  // Sign up with email and password
  async signUp(email, password, userData) {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          user_type: userData.userType
        }
      }
    })

    if (signUpError) throw signUpError

    // Create profile in our custom table
    if (authData.user) {
      try {
        await db.createProfile({
          id: authData.user.id,
          email: authData.user.email,
          name: userData.name,
          user_type: userData.userType
        })
      } catch (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't throw here - user is created, profile can be created later
      }
    }

    return authData
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user with profile
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (user) {
      try {
        const profile = await db.getProfile(user.id)
        return { ...user, profile }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError)
        return user
      }
    }
    
    return null
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}