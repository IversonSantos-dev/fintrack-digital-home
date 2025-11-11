import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const priceToPlantypeMap: Record<string, "pro" | "premium"> = {
  "price_1SSMWg4hxKzkGlDGMwIHVUwH": "pro",
  "price_1SSMXB4hxKzkGlDGECWx3XCL": "premium",
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("Webhook event received:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout completed for session:", session.id);

        const userId = session.metadata?.user_id;
        if (!userId) {
          console.error("No user_id in session metadata");
          break;
        }

        // Get subscription details
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const priceId = subscription.items.data[0].price.id;
          const planType = priceToPlantypeMap[priceId] || "free";
          
          const startDate = new Date(subscription.current_period_start * 1000);
          const endDate = new Date(subscription.current_period_end * 1000);

          // Update subscription in database
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .upsert({
              user_id: userId,
              plan_type: planType,
              status: "active",
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
            });

          if (error) {
            console.error("Error updating subscription:", error);
          } else {
            console.log("Subscription updated successfully for user:", userId);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", subscription.id);

        // Get customer email to find user
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer.deleted) break;

        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const user = userData.users.find(u => u.email === customer.email);
        
        if (!user) {
          console.error("User not found for email:", customer.email);
          break;
        }

        const priceId = subscription.items.data[0].price.id;
        const planType = priceToPlantypeMap[priceId] || "free";
        const status = subscription.status === "active" ? "active" : "cancelled";
        
        const startDate = new Date(subscription.current_period_start * 1000);
        const endDate = new Date(subscription.current_period_end * 1000);

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            plan_type: planType,
            status: status,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          });

        if (error) {
          console.error("Error updating subscription:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription cancelled:", subscription.id);

        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer.deleted) break;

        const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
        const user = userData.users.find(u => u.email === customer.email);
        
        if (!user) break;

        // Set to free plan
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            plan_type: "free",
            status: "cancelled",
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) {
          console.error("Error cancelling subscription:", error);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400 }
    );
  }
});
