import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const createServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Database helper functions
export const db = {
  // User profiles
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Products
  async getProducts(filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        seller:profiles!seller_id(name, email)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getProduct(productId) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:profiles!seller_id(name, email)
      `)
      .eq('id', productId)
      .eq('status', 'approved')
      .single()
    
    if (error) throw error
    return data
  },

  async createProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateProduct(productId, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getSellerProducts(sellerId) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Purchases
  async createPurchase(purchase) {
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchase])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserPurchases(userId) {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        product:products(title, description, file_url),
        seller:profiles!seller_id(name)
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Reviews
  async getProductReviews(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        buyer:profiles!buyer_id(name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createReview(review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}