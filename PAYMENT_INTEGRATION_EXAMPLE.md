# Payment Integration Example

Here's how to integrate the Stripe payment system into your product pages:

## Example Product Page with Payment Integration

```jsx
// app/product/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import PaymentButton from '@/components/PaymentButton';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadData() {
      // Load product
      const { data: productData } = await supabase
        .from('products')
        .select(`
          *,
          profiles!seller_id (
            name,
            avatar_url
          )
        `)
        .eq('id', params.id)
        .eq('status', 'approved')
        .single();

      // Load user
      const { data: { user: userData } } = await supabase.auth.getUser();
      
      setProduct(productData);
      setUser(userData);
      setLoading(false);
    }

    loadData();
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {product.image_urls?.[0] ? (
            <img 
              src={product.image_urls[0]} 
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          
          {/* Additional images */}
          {product.image_urls?.slice(1, 4).map((url, index) => (
            <img 
              key={index}
              src={url} 
              alt={`${product.title} ${index + 2}`}
              className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
            />
          ))}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {product.category}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {product.product_type}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-4xl font-bold text-gray-900">
            ${product.price} {product.currency || 'USD'}
            {product.pricing_model === 'subscription' && (
              <span className="text-lg font-normal text-gray-600">/month</span>
            )}
          </div>

          {/* Description */}
          <div className="text-gray-700">
            <p>{product.description}</p>
          </div>

          {/* Features/Tags */}
          {product.tags && (
            <div>
              <h3 className="font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seller Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Sold by:</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                {product.profiles?.avatar_url ? (
                  <img 
                    src={product.profiles.avatar_url} 
                    alt={product.profiles.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300"></div>
                )}
              </div>
              <div>
                <div className="font-medium">{product.profiles?.name}</div>
                <div className="text-sm text-gray-600">
                  {product.downloads || 0} downloads
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="border-t pt-6">
            <PaymentButton 
              product={product} 
              user={user}
              className="w-full"
            />
            
            {!user && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                <a href="/auth" className="text-blue-600 hover:underline">
                  Sign in
                </a> to purchase this product
              </p>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Instant access</span>
              <span>✓</span>
            </div>
            <div className="flex justify-between">
              <span>30-day money-back guarantee</span>
              <span>✓</span>
            </div>
            <div className="flex justify-between">
              <span>Customer support</span>
              <span>✓</span>
            </div>
            {product.github_url && (
              <div className="flex justify-between">
                <span>Source code included</span>
                <span>✓</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {/* Product Details */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Product Details</h2>
          <div className="space-y-3 text-sm">
            {product.difficulty_level && (
              <div>
                <strong>Difficulty:</strong> {product.difficulty_level}
              </div>
            )}
            {product.setup_time_minutes && (
              <div>
                <strong>Setup time:</strong> ~{product.setup_time_minutes} minutes
              </div>
            )}
            {product.supported_languages?.length > 0 && (
              <div>
                <strong>Languages:</strong> {product.supported_languages.join(', ')}
              </div>
            )}
            {product.input_formats?.length > 0 && (
              <div>
                <strong>Input formats:</strong> {product.input_formats.join(', ')}
              </div>
            )}
            {product.output_formats?.length > 0 && (
              <div>
                <strong>Output formats:</strong> {product.output_formats.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Resources</h2>
          <div className="space-y-2">
            {product.demo_url && (
              <a 
                href={product.demo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                View Demo →
              </a>
            )}
            {product.documentation_url && (
              <a 
                href={product.documentation_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                Documentation →
              </a>
            )}
            {product.github_url && (
              <a 
                href={product.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline"
              >
                View Source Code →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Simple Integration for Existing Pages

If you already have a product page, you can add payments with just a few lines:

```jsx
import PaymentButton from '@/components/PaymentButton';
import { useUser } from '@supabase/auth-helpers-react';

function ExistingProductPage({ product }) {
  const user = useUser();
  
  return (
    <div>
      {/* Your existing product display code */}
      
      {/* Add payment functionality */}
      <div className="mt-6">
        <PaymentButton product={product} user={user} />
      </div>
    </div>
  );
}
```

## Customizing the Payment Button

You can customize the payment button appearance and behavior:

```jsx
<PaymentButton 
  product={product} 
  user={user}
  quantity={2}
  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg"
  disabled={!product.available}
>
  🚀 Launch Your AI Agent - ${product.price * 2}
</PaymentButton>
```

## Handling Different Product Types

```jsx
function ProductPayment({ product, user }) {
  if (product.pricing_model === 'free') {
    return (
      <button className="w-full bg-green-600 text-white py-3 rounded-lg">
        Download Free
      </button>
    );
  }

  if (product.pricing_model === 'subscription') {
    return (
      <PaymentButton product={product} user={user}>
        Subscribe for ${product.price}/month
      </PaymentButton>
    );
  }

  return (
    <PaymentButton product={product} user={user}>
      Buy Once - ${product.price}
    </PaymentButton>
  );
}
```

## Testing Your Integration

1. **Set up test mode**: Ensure `STRIPE_TEST_MODE=true` in your environment
2. **Use test cards**: 
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. **Test the flow**:
   - Click payment button
   - Complete Stripe checkout
   - Verify redirect to success page
   - Check database for completed purchase
   - Test invoice download

## Error Handling

The payment system includes comprehensive error handling:

- Invalid products or users
- Payment failures
- Network issues
- Stripe API errors
- Database errors

All errors are logged and displayed appropriately to users.

## Production Deployment

Before going live:
1. Set `STRIPE_TEST_MODE=false`
2. Update environment variables with live keys
3. Configure webhook URL in Stripe Dashboard
4. Test with real payment methods
5. Monitor webhook delivery