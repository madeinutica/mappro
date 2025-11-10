# Mapro Deployment Guide

## Production Setup

### 1. Environment Variables

For production deployment, you need these environment variables:

#### Frontend (.env or deployment platform settings):
```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://fvrueabzpinhlzyrnhne.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key  # Use pk_live_ for production
```

#### Supabase Edge Functions Environment:
```env
# In Supabase Dashboard > Edge Functions > Environment Variables
STRIPE_SECRET_KEY=sk_live_your_live_secret_key  # Use sk_live_ for production
STRIPE_PRICE_ID_MONTHLY=price_live_monthly_id
STRIPE_PRICE_ID_YEARLY=price_live_yearly_id
STRIPE_WEBHOOK_SECRET=whsec_live_webhook_secret
```

### 2. Supabase Edge Functions Setup

Deploy the Edge Functions to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy cancel-subscription

# Set environment variables in Supabase Dashboard
# Go to Project > Edge Functions > Environment Variables
```

### 3. Database Setup

Run the subscription schema setup:

```sql
-- Execute in Supabase SQL Editor
\i 'subscription-schema.sql'
\i 'setup-subscription-db.sql'
```

### 4. Stripe Webhook Configuration

#### For Production:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Create a new webhook endpoint
3. Set URL to: `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`
4. Add events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to Supabase environment variables

#### For Development:
- The current setup uses local servers, so webhooks won't work in development
- Subscription updates are handled manually after payment completion

### 5. Frontend Deployment Options

#### Option A: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel Dashboard
```

#### Option B: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=build
```

#### Option C: Static Hosting (AWS S3, etc.)
```bash
cd frontend
npm run build
# Upload 'build' folder to your static hosting provider
```

### 6. Production Differences from Local

#### What Works the Same:
- ✅ User authentication (Firebase)
- ✅ Project management (CRUD operations)
- ✅ Map functionality (Mapbox)
- ✅ Photo uploads (Supabase Storage)
- ✅ Feature gating (Pro/Free limits)

#### What Changes for Production:
- 🔄 **Checkout**: Uses Supabase Edge Functions instead of local server
- 🔄 **Webhooks**: Stripe webhooks automatically update subscription status
- 🔄 **URLs**: Uses your production domain instead of localhost
- 🔄 **SSL**: All traffic is HTTPS in production
- 🔄 **Environment**: Uses production Stripe keys and live payment processing

### 7. Testing Production Setup

1. **Staging Environment**: Test with Stripe test keys first
2. **Webhook Testing**: Use ngrok to test webhooks locally:
   ```bash
   ngrok http 3000
   # Use ngrok URL for Stripe webhook during development
   ```

### 8. Domain Configuration

Update these files with your production domain:

1. **supabase/functions/create-checkout-session/index.ts**:
   ```typescript
   const origin = req.headers.get('origin') || 'https://your-domain.com';
   ```

2. **Stripe Dashboard**: Update redirect URLs to your domain

3. **Firebase Console**: Add your domain to authorized domains

### 9. Monitoring and Logs

- **Supabase**: Check Edge Function logs in Dashboard > Edge Functions > Logs
- **Stripe**: Monitor webhooks in Dashboard > Webhooks > Events
- **Frontend**: Use your hosting provider's analytics (Vercel Analytics, Netlify Analytics, etc.)

### 10. Rollback Plan

If issues occur in production:
1. Revert to previous deployment
2. Switch Stripe back to test mode
3. Check Supabase Edge Function logs
4. Verify environment variables are set correctly

---

## Development vs Production Comparison

| Feature | Development (localhost) | Production |
|---------|------------------------|------------|
| Checkout API | Local Node.js server (port 3008) | Supabase Edge Function |
| Subscription Updates | Manual trigger after payment | Automatic via Stripe webhooks |
| HTTPS | HTTP on localhost | HTTPS required |
| Stripe Keys | Test keys (sk_test_, pk_test_) | Live keys (sk_live_, pk_live_) |
| Domain | localhost:3010 | your-domain.com |
| Database Updates | Frontend client with anon key | Webhook with service role key |

The subscription system will work **better** in production because:
- Webhooks will automatically update subscription status
- No dependency on local servers
- Proper SSL/HTTPS security
- Better error handling and monitoring