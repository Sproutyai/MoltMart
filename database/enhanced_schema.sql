-- Enhanced AI Agent Marketplace Schema (Generated with Ollama Qwen2.5:14b insights)
-- Designed specifically for AI agent needs: API integrations, model compatibility, deployments

-- Enable UUID and other extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CORE USER PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('buyer', 'seller', 'agent', 'both')) DEFAULT 'buyer',
  bio TEXT,
  website_url TEXT,
  twitter_handle TEXT,
  github_handle TEXT,
  api_endpoint TEXT, -- For AI agents that have APIs
  agent_capabilities TEXT[], -- What this AI agent can do
  preferred_models TEXT[], -- Models this agent works with
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI MODELS & FRAMEWORKS
CREATE TABLE public.ai_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- openai, anthropic, ollama, huggingface, etc
  model_family TEXT, -- gpt-4, claude, llama, etc
  framework TEXT, -- pytorch, tensorflow, transformers, etc
  architecture TEXT, -- transformer, diffusion, etc
  input_types TEXT[], -- text, image, audio, video, code
  output_types TEXT[], -- text, image, audio, code, json
  max_context_tokens INTEGER,
  cost_per_token DECIMAL(10,8),
  hosted_locally BOOLEAN DEFAULT FALSE,
  api_documentation_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEPLOYMENT ENVIRONMENTS
CREATE TABLE public.deployment_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  environment_type TEXT CHECK (environment_type IN ('local', 'cloud', 'edge', 'serverless')) NOT NULL,
  provider TEXT, -- aws, gcp, azure, vercel, railway, etc
  docker_image TEXT,
  requirements_txt TEXT,
  environment_variables JSONB,
  resource_requirements JSONB, -- CPU, RAM, GPU requirements
  scaling_config JSONB,
  deployment_instructions TEXT,
  cost_estimate JSONB, -- per hour, per request, etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENHANCED PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  product_type TEXT CHECK (product_type IN ('api', 'tool', 'model', 'dataset', 'config', 'workflow', 'integration')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  pricing_model TEXT CHECK (pricing_model IN ('one_time', 'subscription', 'usage_based', 'free')) DEFAULT 'one_time',
  
  -- AI-Specific Fields
  compatible_models UUID[] REFERENCES public.ai_models(id),
  required_dependencies TEXT[],
  supported_languages TEXT[], -- programming languages
  input_formats TEXT[], -- json, csv, xml, yaml, etc
  output_formats TEXT[],
  api_specifications JSONB, -- OpenAPI/Swagger specs
  
  -- Files & Resources
  file_url TEXT,
  demo_url TEXT,
  github_url TEXT,
  documentation_url TEXT,
  image_urls TEXT[],
  
  -- Metadata
  tags TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  setup_time_minutes INTEGER,
  
  -- Status & Metrics
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'deprecated')) DEFAULT 'pending',
  downloads INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. API ENDPOINTS (for products that expose APIs)
CREATE TABLE public.api_endpoints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  endpoint_url TEXT NOT NULL,
  method TEXT CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')) NOT NULL,
  description TEXT,
  request_schema JSONB,
  response_schema JSONB,
  auth_required BOOLEAN DEFAULT FALSE,
  auth_type TEXT, -- bearer, api_key, oauth, etc
  rate_limits JSONB,
  example_request TEXT,
  example_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCT COMPATIBILITY
CREATE TABLE public.product_model_compatibility (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  model_id UUID REFERENCES public.ai_models(id) ON DELETE CASCADE NOT NULL,
  compatibility_status TEXT CHECK (compatibility_status IN ('fully_compatible', 'partially_compatible', 'requires_adaptation', 'incompatible')) DEFAULT 'fully_compatible',
  notes TEXT,
  tested_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PURCHASES WITH USAGE TRACKING
CREATE TABLE public.purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Usage tracking (for subscription/usage-based products)
  usage_limit JSONB, -- API calls, tokens, etc
  usage_current JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ENHANCED REVIEWS WITH AI-SPECIFIC CRITERIA
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Standard review fields
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5) NOT NULL,
  title TEXT,
  content TEXT,
  
  -- AI-specific rating criteria
  ease_of_integration INTEGER CHECK (ease_of_integration >= 1 AND ease_of_integration <= 5),
  documentation_quality INTEGER CHECK (documentation_quality >= 1 AND documentation_quality <= 5),
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  
  -- Context
  use_case TEXT, -- What they used it for
  model_used TEXT, -- Which AI model they used it with
  setup_difficulty TEXT CHECK (setup_difficulty IN ('very_easy', 'easy', 'moderate', 'difficult', 'very_difficult')),
  
  -- Metadata
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COLLECTIONS/BUNDLES
CREATE TABLE public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('bundle', 'workflow', 'starter_kit', 'template')) DEFAULT 'bundle',
  price DECIMAL(10,2),
  discount_percentage DECIMAL(5,2) DEFAULT 0.0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. COLLECTION ITEMS
CREATE TABLE public.collection_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_ai_models_provider ON public.ai_models(provider);
CREATE INDEX idx_ai_models_model_family ON public.ai_models(model_family);
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_product_type ON public.products(product_type);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_purchases_buyer_id ON public.purchases(buyer_id);
CREATE INDEX idx_purchases_seller_id ON public.purchases(seller_id);
CREATE INDEX idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON public.reviews(buyer_id);
CREATE INDEX idx_reviews_overall_rating ON public.reviews(overall_rating);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_model_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- AI Models policies (public read)
CREATE POLICY "Anyone can view AI models" ON public.ai_models FOR SELECT USING (true);

-- Products policies
CREATE POLICY "Anyone can view approved products" ON public.products FOR SELECT USING (status = 'approved' OR auth.uid() = seller_id);
CREATE POLICY "Sellers can create products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);

-- Purchases policies
CREATE POLICY "Users can view own purchases" ON public.purchases 
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create purchases" ON public.purchases 
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews for purchased products" ON public.reviews 
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND 
    EXISTS (
      SELECT 1 FROM public.purchases 
      WHERE buyer_id = auth.uid() 
      AND product_id = reviews.product_id 
      AND status = 'completed'
    )
  );

-- Collections policies
CREATE POLICY "Anyone can view public collections" ON public.collections 
  FOR SELECT USING (is_public = true OR auth.uid() = creator_id);
CREATE POLICY "Users can create collections" ON public.collections 
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own collections" ON public.collections 
  FOR UPDATE USING (auth.uid() = creator_id);

-- TRIGGERS for auto-updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products SET
    average_rating = (
      SELECT AVG(overall_rating)::DECIMAL(3,2) 
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE update_product_rating();