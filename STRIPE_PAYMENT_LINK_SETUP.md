# Quick Stripe Payment Link Setup

## Step 1: Create a Payment Link in Stripe

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to**: Products → Payment links
3. **Click**: "Create payment link"
4. **Configure**:
   - Name: "Mapro Pro Subscription"
   - Price: $29/month (or your preferred price)
   - Billing: Recurring monthly
   - After completion: Custom redirect URL
   - Success URL: `https://your-render-domain.onrender.com/?success=true&client_id={CLIENT_REFERENCE_ID}&plan_id=pro`
   - Cancel URL: `https://your-render-domain.onrender.com/?canceled=true`

5. **Advanced Settings**:
   - Enable "Collect customer information" → Email address
   - Enable "Allow promotion codes" (optional)

6. **Save and Copy** the payment link URL

## Step 2: Update the Code

Replace the test URL in SubscriptionManager.jsx:

```javascript
// Replace this line:
const paymentLink = `https://buy.stripe.com/test_7sI9AUdVm7nF1QA7ss?client_reference_id=${clientId}...`;

// With your actual payment link:
const paymentLink = `https://buy.stripe.com/live_YOUR_PAYMENT_LINK_ID?client_reference_id=${clientId}...`;
```

## Step 3: Test the Flow

1. User clicks "Upgrade to Pro"
2. Redirects to Stripe payment page
3. After successful payment, redirects back with success=true
4. App detects success and updates subscription in database
5. User gets Pro access immediately

This approach works immediately without needing Edge Functions!