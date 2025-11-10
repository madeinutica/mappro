# Stripe Setup Instructions for Mapro Subscription System

## Overview
Mapro uses Stripe for subscription billing with two tiers:
- **Free**: $0/month, limited to 5 projects
- **Pro**: $29.99/month, unlimited projects + premium features

## Step 1: Create Products in Stripe Dashboard

### 1.1 Create the "Mapro Pro" Product
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** in the left sidebar
3. Click **"Create Product"**
4. Fill in the product details:
   - **Name**: Mapro Pro
   - **Description**: Full access to all Mapro features including unlimited projects, advanced customization, priority support, data export, and custom branding
   - **Image**: (Optional) Upload the Mapro logo
5. Click **"Create Product"**

### 1.2 Create the Monthly Price
1. In the product details page, click **"Create Price"**
2. Configure the price:
   - **Price**: $29.99
   - **Currency**: USD
   - **Billing interval**: Monthly
   - **Price ID**: This will be auto-generated (copy this for the database)
3. Click **"Create Price"**

## Step 2: Update Database with Stripe Price IDs

After creating the price in Stripe, you'll get a Price ID that looks like `price_1ABC...`. Update the database:

```sql
-- Update the Pro plan with the real Stripe price ID
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1ABC...your_actual_price_id'
WHERE id = 'pro';
```

## Step 3: Configure Webhook Endpoints

### 3.1 Create Webhook Endpoint
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **"Add endpoint"**
3. Set the endpoint URL to: `https://your-supabase-url.supabase.co/functions/v1/stripe-webhook`
4. Select the following events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**

### 3.2 Copy Webhook Secret
1. After creating the webhook, copy the **Signing secret**
2. Add this to your Supabase Edge Function environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 4: Environment Variables

Make sure these environment variables are set in your Supabase project:

```bash
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

## Step 5: Test the Integration

1. Start your development server
2. Go to the Admin panel > Subscription tab
3. Try subscribing to the Pro plan
4. Verify that:
   - Stripe checkout opens
   - Payment succeeds
   - Subscription status updates in the database
   - Webhook events are processed

## Troubleshooting

### Common Issues:
1. **Webhook not firing**: Check that the endpoint URL is correct and the webhook secret is properly set
2. **Subscription not activating**: Verify that the Stripe price ID in the database matches the one created in Stripe
3. **Payment failing**: Check Stripe logs for detailed error messages

### Testing in Development:
- Use Stripe test cards: `4242 4242 4242 4242`
- All test payments should succeed with this card
- Webhooks will still fire in development mode

## Production Deployment

When ready for production:
1. Create products and prices in your live Stripe account
2. Update the database with live price IDs
3. Set up production webhook endpoints
4. Update environment variables with live keys
5. Test thoroughly before going live</content>
<parameter name="filePath">c:\Users\ErickFlorez\Projects\mapro\STRIPE_SETUP.md