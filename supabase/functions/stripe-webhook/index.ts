// Stripe webhook handler for subscription events
// Deploy as Supabase Edge Function

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

export async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Log the event
    await supabase.from('subscription_events').insert({
      event_type: event.type,
      event_data: event.data,
      stripe_event_id: event.id
    });

    const session = event.data.object;
    const clientId = session.metadata?.client_id;

    if (!clientId) {
      console.log('No client_id in metadata, skipping');
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        // Payment was successful, update subscription
        await supabase
          .from('clients')
          .update({
            subscription_status: 'active',
            subscription_plan: session.metadata.plan_id,
            subscription_id: session.subscription
          })
          .eq('id', clientId);
        break;

      case 'invoice.payment_succeeded':
        // Subscription payment succeeded
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await supabase
            .from('clients')
            .update({
              subscription_status: 'active',
              subscription_expires_at: new Date(subscription.current_period_end * 1000)
            })
            .eq('id', clientId);
        }
        break;

      case 'invoice.payment_failed':
        // Payment failed
        await supabase
          .from('clients')
          .update({
            subscription_status: 'past_due'
          })
          .eq('id', clientId);
        break;

      case 'customer.subscription.deleted':
        // Subscription cancelled
        await supabase
          .from('clients')
          .update({
            subscription_status: 'cancelled',
            subscription_plan: 'free'
          })
          .eq('id', clientId);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}