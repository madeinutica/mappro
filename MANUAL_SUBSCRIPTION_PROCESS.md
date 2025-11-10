# Manual Subscription Upgrade Process

Since the automated Stripe integration needs more setup, here's how to handle Pro upgrades manually for now:

## When a Customer Wants to Upgrade:

### 1. Customer Action:
- Customer clicks "Upgrade to Pro" 
- Gets a message with their Client ID
- They contact you with their Client ID

### 2. Your Action (Manual Upgrade):
Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/fvrueabzpinhlzyrnhne/editor) and run this SQL:

```sql
-- Replace 'CLIENT_ID_HERE' with the actual client ID
UPDATE clients 
SET 
    subscription_status = 'active',
    subscription_plan = 'pro',
    subscription_id = 'manual-upgrade-' || now()::text
WHERE id = 'CLIENT_ID_HERE';
```

### 3. Immediate Results:
- Customer gets unlimited project access
- All Pro features unlock instantly
- No payment processing delays

## To Set Up Real Stripe Payments Later:

### Option 1: Simple Payment Links
1. Create payment links in Stripe Dashboard
2. Replace the alert with: `window.location.href = 'your-stripe-payment-link'`

### Option 2: Full Integration
1. Deploy the Supabase Edge Functions
2. Set up Stripe webhooks
3. Enable automatic subscription updates

## Current Pro Features:
- ✅ Unlimited projects (vs 5 for free)
- ✅ Full map customization
- ✅ Advanced analytics
- ✅ Priority support
- ✅ White-label options

This manual approach lets you start selling Pro subscriptions immediately while you set up the automated payment system!