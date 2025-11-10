# Subscription System Testing Guide

## Overview
This guide provides comprehensive testing procedures for the Mapro subscription system, including manual testing steps and automated verification checks.

## Prerequisites

### Environment Setup
1. **Development Server Running**
   ```bash
   cd frontend
   npm start
   ```

2. **Supabase Functions Deployed**
   - `create-checkout-session` function deployed
   - `stripe-webhook` function deployed
   - Environment variables configured

3. **Database Setup**
   - Subscription schema applied
   - Subscription plans populated
   - Stripe price IDs configured

4. **Stripe Configuration**
   - Products and prices created
   - Webhook endpoints configured
   - Test mode enabled

## Test Scenarios

### 1. Free Tier User Experience

#### 1.1 Project Creation Limits
**Objective**: Verify that free users are limited to 5 projects

**Steps**:
1. Log in as a free user (no active subscription)
2. Navigate to Admin > Dashboard
3. Verify "Add New Project" button shows project count (e.g., "0/5 projects")
4. Create projects up to the limit:
   - Create 4 projects successfully
   - Attempt to create 6th project
   - Verify upgrade prompt appears
   - Verify redirect to Subscription tab

**Expected Results**:
- ✅ Projects 1-5 created successfully
- ✅ 6th project blocked with upgrade message
- ✅ "Upgrade to add more" link visible
- ✅ Automatic redirect to subscription management

#### 1.2 Feature Access Control
**Objective**: Verify feature gating prevents access to Pro features

**Steps**:
1. Check modal builder access (should work - basic customization)
2. Check map builder access (should work - basic customization)
3. Attempt advanced features (should show upgrade prompts)

**Expected Results**:
- ✅ Basic features accessible
- ✅ Advanced features show upgrade prompts

### 2. Subscription Management Interface

#### 2.1 Subscription Tab Access
**Objective**: Verify subscription management UI loads correctly

**Steps**:
1. Navigate to Admin > Subscription tab
2. Verify UI loads without errors
3. Check current plan display
4. Verify plan comparison cards
5. Check usage statistics

**Expected Results**:
- ✅ Tab loads successfully
- ✅ Current plan shows "Free Plan"
- ✅ Pro plan shows $29.99/month
- ✅ Usage stats display correctly

#### 2.2 Usage Statistics Accuracy
**Objective**: Verify usage statistics reflect actual data

**Steps**:
1. Create test projects
2. Publish some projects
3. Check subscription tab usage stats
4. Compare with actual project counts

**Expected Results**:
- ✅ Total projects count matches
- ✅ Published projects count matches
- ✅ Statistics update in real-time

### 3. Stripe Checkout Integration

#### 3.1 Checkout Session Creation
**Objective**: Verify Stripe checkout opens correctly

**Steps**:
1. Click "Subscribe to Pro" button
2. Verify Stripe checkout modal opens
3. Check product details in checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete payment

**Expected Results**:
- ✅ Checkout modal opens
- ✅ Product name: "Mapro Pro"
- ✅ Price: $29.99/month
- ✅ Test payment succeeds

#### 3.2 Post-Payment User Experience
**Objective**: Verify subscription activation and UI updates

**Steps**:
1. Complete Stripe payment
2. Verify redirect back to application
3. Check subscription status update
4. Verify Pro features become accessible
5. Check project limit removal

**Expected Results**:
- ✅ Redirect to success page
- ✅ Subscription status shows "Pro Plan"
- ✅ Project limit shows "Unlimited"
- ✅ Pro features accessible

### 4. Webhook Processing

#### 4.1 Subscription Events
**Objective**: Verify webhook events update database correctly

**Steps**:
1. Monitor Supabase function logs during payment
2. Check database after successful payment:
   ```sql
   SELECT subscription_status, subscription_plan, stripe_customer_id
   FROM clients WHERE id = 'user_id';
   ```
3. Verify subscription_events table populated

**Expected Results**:
- ✅ subscription_status = 'active'
- ✅ subscription_plan = 'pro'
- ✅ stripe_customer_id populated
- ✅ subscription_events logged

#### 4.2 Failed Payment Handling
**Objective**: Verify failed payments are handled gracefully

**Steps**:
1. Use failing test card: `4000 0000 0000 0002`
2. Attempt payment
3. Verify error handling
4. Check no subscription created

**Expected Results**:
- ✅ Payment fails gracefully
- ✅ User sees error message
- ✅ No subscription created
- ✅ User can retry

### 5. Subscription Cancellation

#### 5.1 Cancellation Flow
**Objective**: Verify users can cancel subscriptions

**Steps**:
1. As Pro user, go to Subscription tab
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Verify subscription status changes
5. Check access reverts to free tier

**Expected Results**:
- ✅ Cancellation confirmation dialog
- ✅ Subscription marked as cancelled
- ✅ Access reverts to free tier limits
- ✅ Pro features disabled

## Automated Testing

### Unit Tests for Feature Gating

```javascript
// Test feature gating logic
import { canPerformAction, checkFeatureAccess, FEATURES } from '../utils/featureGating';

// Test free user limits
const freeUser = { subscription_plan: 'free', subscription_status: 'active' };
assert(canPerformAction(FEATURES.MAX_PROJECTS, 3, freeUser) === true);
assert(canPerformAction(FEATURES.MAX_PROJECTS, 6, freeUser) === false);

// Test pro user unlimited access
const proUser = { subscription_plan: 'pro', subscription_status: 'active' };
assert(canPerformAction(FEATURES.MAX_PROJECTS, 100, proUser) === true);
```

### API Endpoint Testing

```bash
# Test checkout session creation
curl -X POST https://your-project.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clientId": "test-client-id", "planId": "pro"}'

# Expected: 200 OK with sessionId
```

## Performance Testing

### Load Testing
- Test concurrent subscription attempts
- Verify webhook processing under load
- Check database performance with multiple users

### Memory Usage
- Monitor Edge Function memory usage
- Verify no memory leaks in subscription flows

## Security Testing

### Authentication
- Verify user can only manage their own subscription
- Test unauthorized access attempts
- Check proper JWT validation

### Data Validation
- Test malformed webhook payloads
- Verify Stripe signature validation
- Check SQL injection prevention

## Monitoring and Logging

### Error Tracking
- Monitor for failed payments
- Track webhook processing errors
- Log subscription lifecycle events

### Analytics
- Track conversion rates (free to pro)
- Monitor churn rates
- Analyze feature usage patterns

## Rollback Procedures

### Emergency Rollback
1. **Disable Stripe webhooks** temporarily
2. **Revert database schema** if needed
3. **Update frontend** to hide subscription features
4. **Communicate** with affected users

### Partial Rollback
1. **Disable new subscriptions** while keeping existing active
2. **Fix issues** in Edge Functions
3. **Redeploy** fixed functions
4. **Re-enable** subscription creation

## Success Criteria

### Functional Requirements
- ✅ Free users limited to 5 projects
- ✅ Pro users have unlimited projects
- ✅ Stripe checkout works correctly
- ✅ Webhooks process subscription events
- ✅ UI updates reflect subscription status
- ✅ Feature gating works across all components

### Non-Functional Requirements
- ✅ Checkout completes within 5 seconds
- ✅ Webhook processing within 2 seconds
- ✅ UI updates within 1 second
- ✅ No memory leaks in Edge Functions
- ✅ Proper error handling and user feedback

## Post-Launch Monitoring

### Key Metrics to Track
1. **Conversion Rate**: Free to Pro subscriptions
2. **Churn Rate**: Subscription cancellations
3. **Failed Payments**: Payment processing errors
4. **Webhook Failures**: Integration issues
5. **User Engagement**: Feature usage by plan type

### Alert Conditions
- Webhook failure rate > 5%
- Payment failure rate > 10%
- Function timeout rate > 1%
- Database connection errors > 0%

This testing guide ensures comprehensive validation of the subscription system before production deployment.</content>
<parameter name="filePath">c:\Users\ErickFlorez\Projects\mapro\SUBSCRIPTION_TESTING.md