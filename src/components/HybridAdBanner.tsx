import { useState } from "react";
import { AdBanner } from "./AdBanner";
import { AdSenseAd } from "./AdSenseAd";
import { useSubscription } from "@/hooks/useSubscription";

interface HybridAdBannerProps {
  variant?: "horizontal" | "sidebar" | "inline";
  adSlot?: string;
  showInternal?: boolean;
  showExternal?: boolean;
  className?: string;
}

export const HybridAdBanner = ({
  variant = "horizontal",
  adSlot = "",
  showInternal = true,
  showExternal = true,
  className = ""
}: HybridAdBannerProps) => {
  const { subscription, loading } = useSubscription();
  const [showInternalAd] = useState(() => Math.random() > 0.5); // 50/50 split

  // Don't show ads for pro/premium users
  if (loading) return null;
  if (subscription?.plan_type === "pro" || subscription?.plan_type === "premium") return null;

  // If only internal ads are enabled
  if (showInternal && !showExternal) {
    return <AdBanner variant={variant} className={className} />;
  }

  // If only external ads are enabled
  if (showExternal && !showInternal && adSlot) {
    return (
      <AdSenseAd 
        adSlot={adSlot} 
        adFormat={variant === "sidebar" ? "vertical" : "horizontal"}
        className={className}
      />
    );
  }

  // Hybrid mode - alternate between internal and external
  if (showInternal && showExternal) {
    if (showInternalAd || !adSlot) {
      return <AdBanner variant={variant} className={className} />;
    }
    return (
      <AdSenseAd 
        adSlot={adSlot} 
        adFormat={variant === "sidebar" ? "vertical" : "horizontal"}
        className={className}
      />
    );
  }

  return null;
};
