export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url?: string | null
  website?: string | null
  github_username?: string | null
  twitter_username?: string | null
  github_verified?: boolean
  twitter_verified?: boolean
  github_avatar_url?: string | null
  github_repos_count?: number | null
  github_followers_count?: number | null
  github_created_at?: string | null
  twitter_avatar_url?: string | null
  twitter_followers_count?: number | null
  twitter_tweet_count?: number | null
  social_stats_updated_at?: string | null
  specialties?: string[]
  is_seller: boolean
  is_verified?: boolean
  follower_count?: number
  created_at: string
  last_active_at?: string | null
}

export interface SellerStats {
  total_templates: number
  total_downloads: number
  avg_rating: number
  total_reviews: number
}

export interface Template {
  id: string
  seller_id: string
  title: string
  slug: string
  description: string
  long_description: string | null
  category: string
  tags: string[]
  price_cents: number
  file_path: string
  preview_data: {
    soul_md?: string
    agents_md?: string
    file_list?: string[]
  }
  download_count: number
  avg_rating: number
  review_count: number
  status: 'draft' | 'published' | 'archived'
  compatibility: string
  screenshots: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  ai_models: string[]
  requirements: string | null
  version: string
  license: string
  demo_video_url: string | null
  setup_instructions: string | null
  created_at: string
  updated_at: string
  seller?: Profile
}

export interface Purchase {
  id: string
  buyer_id: string
  template_id: string
  price_cents: number
  created_at: string
  template?: Template
}

export interface SellerTransaction {
  id: string
  price_cents: number
  platform_fee_cents: number
  seller_earnings_cents: number
  status: 'completed' | 'pending' | 'refunded'
  created_at: string
  template_id: string
  template_title: string
  template_slug: string
  buyer_username: string
  buyer_display_name: string | null
}

export interface TransactionSummary {
  total_earnings_cents: number
  earnings_this_month_cents: number
  earnings_this_week_cents: number
  total_transactions: number
  avg_sale_cents: number
  top_template: { id: string; title: string; sales_count: number } | null
}

export interface TransactionFilters {
  period: 'week' | 'month' | 'year' | 'all'
  template_id?: string
  status?: 'completed' | 'pending' | 'refunded'
  sort: 'date' | 'amount' | 'template'
  order: 'asc' | 'desc'
  page: number
  per_page: number
}

export interface Review {
  id: string
  buyer_id: string
  template_id: string
  rating: number
  comment: string | null
  created_at: string
  buyer?: Profile
}

// ─── Affiliate Types ───

export interface Affiliate {
  id: string
  user_id: string
  referral_code: string
  commission_rate: number
  status: 'active' | 'paused' | 'banned'
  total_clicks: number
  total_signups: number
  total_sales: number
  total_earnings_cents: number
  created_at: string
}

export interface Referral {
  id: string
  affiliate_id: string
  referred_user_id: string
  created_at: string
  referred_user?: { display_name: string | null; username: string }
}

export interface AffiliateEarning {
  id: string
  affiliate_id: string
  purchase_id: string
  referred_user_id: string
  sale_amount_cents: number
  commission_rate: number
  commission_cents: number
  status: 'pending' | 'approved' | 'paid' | 'reversed'
  approved_at: string | null
  created_at: string
  purchase?: { template?: { title: string } }
}

export interface AffiliateStats {
  total_clicks: number
  total_signups: number
  total_sales: number
  total_earnings_cents: number
  pending_cents: number
  approved_cents: number
  paid_cents: number
}


export interface Promotion {
  id: string
  template_id: string
  seller_id: string
  promoted_at: string
  amount_paid_cents: number
  stripe_session_id: string | null
  impressions: number
  clicks: number
  created_at: string
  template?: Template & { seller?: { username: string; display_name: string | null; avatar_url?: string | null } }
}
