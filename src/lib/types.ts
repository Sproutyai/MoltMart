export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_seller: boolean
  created_at: string
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

export interface Review {
  id: string
  buyer_id: string
  template_id: string
  rating: number
  comment: string | null
  created_at: string
  buyer?: Profile
}
