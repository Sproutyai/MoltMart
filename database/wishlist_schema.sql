-- Wishlist/Favorites functionality for Molt Mart
-- Additional schema for buyer dashboard features

-- Wishlist Table
CREATE TABLE public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(buyer_id, product_id)
);

-- Indexes
CREATE INDEX idx_wishlists_buyer_id ON public.wishlists(buyer_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

-- Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can view own wishlist" ON public.wishlists
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can manage own wishlist" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can remove from own wishlist" ON public.wishlists
  FOR DELETE USING (auth.uid() = buyer_id);

-- Order Status Tracking Enhancement
-- Add additional status tracking to purchases table
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'pending';
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMPTZ;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Purchase Notes/Reviews Connection
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS buyer_notes TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT FALSE;