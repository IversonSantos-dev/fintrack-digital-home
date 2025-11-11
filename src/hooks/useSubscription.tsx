import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PlanType = "free" | "pro" | "premium";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: "active" | "expired" | "cancelled";
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setSubscription(data as Subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (planType: PlanType, durationMonths: number = 1) => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer upgrade");
      return false;
    }

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const { data, error } = await supabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: planType,
          status: "active",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSubscription(data as Subscription);
      toast.success(`Plano ${planType.toUpperCase()} ativado com sucesso!`);
      return true;
    } catch (error) {
      console.error("Error upgrading plan:", error);
      toast.error("Erro ao ativar plano. Tente novamente.");
      return false;
    }
  };

  const hasFeatureAccess = (requiredPlan: PlanType): boolean => {
    if (!subscription || subscription.status !== "active") return false;

    const planHierarchy: Record<PlanType, number> = {
      free: 0,
      pro: 1,
      premium: 2,
    };

    return planHierarchy[subscription.plan_type] >= planHierarchy[requiredPlan];
  };

  const canAccessProFeatures = hasFeatureAccess("pro");
  const canAccessPremiumFeatures = hasFeatureAccess("premium");

  return {
    subscription,
    loading,
    upgradePlan,
    hasFeatureAccess,
    canAccessProFeatures,
    canAccessPremiumFeatures,
    refetch: fetchSubscription,
  };
};
