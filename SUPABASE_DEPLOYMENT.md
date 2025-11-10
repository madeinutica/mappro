# Deploying Supabase Edge Functions for Mapro

## Prerequisites

1. **Supabase CLI**: Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```

2. **Supabase Project**: Make sure you have a Supabase project set up
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Environment Variables**: Set up the required environment variables in your Supabase project:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret from Stripe
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

## Step 1: Deploy Edge Functions

### 1.1 Deploy create-checkout-session function
```bash
supabase functions deploy create-checkout-session
```

### 1.2 Deploy stripe-webhook function
```bash
supabase functions deploy stripe-webhook
```

### 1.3 Deploy all functions at once
```bash
supabase functions deploy
```

## Step 2: Set Environment Variables

Set the environment variables for your functions:

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Set webhook secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret

# Set publishable key (for client-side use)
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_test_...your_publishable_key
```

## Step 3: Verify Deployment

### 3.1 Check function status
```bash
supabase functions list
```

### 3.2 Test functions locally (optional)
```bash
# Start local development server
supabase start

# Serve functions locally
supabase functions serve
```

## Step 4: Update Frontend Configuration

Make sure your frontend `.env` file has the correct Supabase URL and anon key:

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...your_publishable_key
```

## Step 5: Test the Integration

1. **Start your frontend development server**
   ```bash
   cd frontend
   npm start
   ```

2. **Test the subscription flow**:
   - Go to Admin > Subscription tab
   - Click "Subscribe to Pro"
   - Complete the Stripe checkout process
   - Verify subscription status updates

3. **Check webhook processing**:
   - Monitor Supabase function logs
   - Verify database updates after payment

## Troubleshooting

### Function Deployment Issues

**Error: Function not found**
- Make sure you're in the correct directory (`/supabase/functions/`)
- Check that `index.ts` files exist in each function directory

**Error: Environment variables not set**
- Use `supabase secrets list` to check current secrets
- Redeploy functions after setting secrets

### Runtime Issues

**Error: Stripe key not found**
- Verify environment variables are set correctly
- Check function logs: `supabase functions logs`

**Error: Database connection failed**
- Ensure your Supabase project is properly linked
- Check database permissions for the functions

### Testing Issues

**Checkout not working**
- Verify Stripe publishable key in frontend
- Check browser console for JavaScript errors
- Ensure Stripe products/prices are created

**Webhooks not firing**
- Check webhook endpoint URL in Stripe dashboard
- Verify webhook secret matches
- Monitor Supabase function logs

## Production Deployment

For production deployment:

1. **Use live Stripe keys** instead of test keys
2. **Update webhook URLs** to point to production Supabase functions
3. **Set production environment variables**
4. **Test thoroughly** with real payment methods
5. **Monitor function performance** and logs

## Function URLs

After deployment, your functions will be available at:
- `https://your-project-ref.supabase.co/functions/v1/create-checkout-session`
- `https://your-project-ref.supabase.co/functions/v1/stripe-webhook`

## Security Notes

- Never commit Stripe secret keys to version control
- Use environment variables for all sensitive configuration
- Regularly rotate webhook secrets
- Monitor function usage and costs</content>
<parameter name="filePath">c:\Users\ErickFlorez\Projects\mapro\SUPABASE_DEPLOYMENT.md