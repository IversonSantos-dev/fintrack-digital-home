import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

const getSessionId = () => {
  let sessionId = sessionStorage.getItem("ad_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("ad_session_id", sessionId);
  }
  return sessionId;
};

export const useAdAnalytics = () => {
  const trackedImpressions = useRef<Set<string>>(new Set());

  const trackEvent = async (
    adId: string,
    adVariant: string,
    eventType: "impression" | "click" | "dismiss"
  ) => {
    // Prevent duplicate impressions in the same session
    const impressionKey = `${adId}-${adVariant}-impression`;
    if (eventType === "impression" && trackedImpressions.current.has(impressionKey)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("ad_analytics").insert({
        ad_id: adId,
        ad_variant: adVariant,
        event_type: eventType,
        user_id: user?.id || null,
        session_id: getSessionId(),
        page_url: window.location.pathname,
      });

      if (eventType === "impression") {
        trackedImpressions.current.add(impressionKey);
      }
    } catch (error) {
      console.error("Error tracking ad event:", error);
    }
  };

  const trackImpression = (adId: string, adVariant: string) => {
    trackEvent(adId, adVariant, "impression");
  };

  const trackClick = (adId: string, adVariant: string) => {
    trackEvent(adId, adVariant, "click");
  };

  const trackDismiss = (adId: string, adVariant: string) => {
    trackEvent(adId, adVariant, "dismiss");
  };

  return { trackImpression, trackClick, trackDismiss };
};
