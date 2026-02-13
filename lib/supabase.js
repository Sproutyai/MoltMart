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
  // User profiles (simplified users table)
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createUser(user) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Legacy support for existing code
  getProfile: function(userId) { return this.getUser(userId) },
  updateProfile: function(userId, updates) { return this.updateUser(userId, updates) },
  createProfile: function(profile) { return this.createUser(profile) },

  // Products (updated for simplified schema)
  async getProducts(filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        seller:users!seller_id(full_name, email, username)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getProduct(productId) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:users!seller_id(full_name, email, username)
      `)
      .eq('id', productId)
      .eq('status', 'active')
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
      .from('orders')
      .select(`
        *,
        product:products(title, description),
        seller:users!seller_id(full_name)
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
  },

  // Wishlist/Favorites
  async addToWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlists')
      .insert([{ buyer_id: userId, product_id: productId }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async removeFromWishlist(userId, productId) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('buyer_id', userId)
      .eq('product_id', productId)
    
    if (error) throw error
    return true
  },

  async getUserWishlist(userId) {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products(
          id, title, description, price, image_urls, category, tags,
          seller:profiles!seller_id(name)
        )
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async isInWishlist(userId, productId) {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('buyer_id', userId)
      .eq('product_id', productId)
      .single()
    
    return !error && data
  },

  // Enhanced Purchases for Order Tracking
  async updatePurchaseStatus(purchaseId, updates) {
    const { data, error } = await supabase
      .from('purchases')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getBuyerPurchases(userId) {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        product:products(
          id, title, description, image_urls, category, file_url,
          seller:profiles!seller_id(name, email)
        )
      `)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Recommendations based on purchase history
  async getRecommendations(userId, limit = 6) {
    // Get user's purchased categories
    const { data: purchases } = await supabase
      .from('purchases')
      .select('product:products(category, tags)')
      .eq('buyer_id', userId)
      .eq('status', 'completed')
    
    if (!purchases || purchases.length === 0) {
      // Return popular products if no purchase history
      return await this.getPopularProducts(limit)
    }

    // Extract categories and tags from purchase history
    const categories = [...new Set(purchases.map(p => p.product?.category).filter(Boolean))]
    const allTags = purchases.flatMap(p => p.product?.tags || [])
    const popularTags = [...new Set(allTags)].slice(0, 5)

    // Get products in same categories or with similar tags
    let query = supabase
      .from('products')
      .select(`
        *,
        seller:profiles!seller_id(name)
      `)
      .eq('status', 'approved')
      .not('seller_id', 'eq', userId) // Don't recommend user's own products

    if (categories.length > 0) {
      query = query.in('category', categories)
    }

    const { data, error } = await query
      .limit(limit * 2) // Get more to filter
      .order('average_rating', { ascending: false })
    
    if (error) throw error

    // Filter and score recommendations
    let recommendations = (data || [])
      .filter(product => {
        // Exclude products already purchased
        return !purchases.some(p => p.product?.id === product.id)
      })
      .map(product => {
        let score = 0
        
        // Category match
        if (categories.includes(product.category)) score += 10
        
        // Tag matches
        const matchingTags = (product.tags || []).filter(tag => popularTags.includes(tag))
        score += matchingTags.length * 3
        
        // Rating boost
        score += (product.average_rating || 0) * 2
        
        return { ...product, _score: score }
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)

    return recommendations
  },

  async getPopularProducts(limit = 6) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:profiles!seller_id(name)
      `)
      .eq('status', 'approved')
      .order('downloads', { ascending: false })
      .order('average_rating', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  }
}