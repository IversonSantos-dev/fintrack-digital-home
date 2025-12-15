import { useEffect, useRef } from "react";
import { useSubscription } from "@/hooks/useSubscription";

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  className?: string;
  style?: React.CSSProperties;
}

// Publisher ID - configure this with your AdSense publisher ID
const ADSENSE_PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || "";

export const AdSenseAd = ({ 
  adSlot, 
  adFormat = "auto", 
  className = "",
  style 
}: AdSenseAdProps) => {
  const { subscription, loading } = useSubscription();
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Don't show ads for pro/premium users
    if (loading) return;
    if (subscription?.plan_type === "pro" || subscription?.plan_type === "premium") return;
    if (!ADSENSE_PUBLISHER_ID) return;

    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    // Push ad only once
    if (!isAdLoaded.current && adRef.current) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [loading, subscription]);

  // Don't render for pro/premium users or while loading
  if (loading) return null;
  if (subscription?.plan_type === "pro" || subscription?.plan_type === "premium") return null;
  if (!ADSENSE_PUBLISHER_ID) {
    // Show placeholder when AdSense is not configured
    return (
      <div className={`bg-muted/30 border border-dashed border-border rounded-lg p-4 text-center ${className}`}>
        <p className="text-xs text-muted-foreground">AdSense não configurado</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          ...style
        }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};
