# Payment Setup Guide

## Stripe Payment Links

I've configured the subscription system to use Stripe Payment Links, which are the simplest way to accept payments. Here's how it works:

### Test Payment Links (Active)

**Monthly Pro Subscription ($9.99/month):**
- URL: `https://buy.stripe.com/test_4gwbLU8Bo4Zn9kgcPO`
- Price: $9.99 per month
- Features: Unlimited projects, premium support

**Yearly Pro Subscription ($99/year):**
- URL: `https://buy.stripe.com/test_bIY29kbn53Xy73ifGH`  
- Price: $99 per year (save ~17%)
- Features: Unlimited projects, premium support

### How Payment Works

1. **Development Mode (localhost):**
   - Uses local backend server for testing
   - Processes payments through our local Stripe integration
   - Full webhook handling for testing

2. **Production Mode (live site):**
   - Uses Stripe Payment Links for immediate functionality
   - Customer gets redirected to Stripe-hosted checkout
   - Automatic return to your site after payment
   - Pre-filled customer email and client reference ID

### Current Status

✅ **Local Development:** Payment processing with webhooks  
✅ **Production:** Direct Stripe Payment Links  
✅ **Test Mode:** All payments are in Stripe test mode  
✅ **Customer Data:** Email and client ID automatically passed  
✅ **Return Handling:** Customers return to your site after payment  

### Next Steps for Production

1. **Update to Live Keys:** Replace test keys with live Stripe keys
2. **Create Live Payment Links:** Create production payment links in Stripe Dashboard
3. **Test Real Payments:** Use real credit card for final testing
4. **Enable Webhooks:** Set up webhooks to automatically upgrade accounts

### Test Credit Cards

Use these test cards in Stripe checkout:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155

Any future expiry date and any 3-digit CVC code will work.