import { useSubscription } from "@/hooks/useSubscription";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";

interface AdBannerProps {
  variant?: "horizontal" | "sidebar" | "inline";
  className?: string;
}

const adContent = [
  {
    id: "upgrade_pro",
    title: "Upgrade para Pro",
    description: "Remova anúncios e desbloqueie recursos avançados",
    cta: "Fazer Upgrade",
    type: "internal",
  },
  {
    id: "organize_finances",
    title: "Organize suas finanças",
    description: "Controle total dos seus gastos com relatórios detalhados",
    cta: "Conhecer Pro",
    type: "internal",
  },
  {
    id: "no_limits",
    title: "Sem limites",
    description: "Transações ilimitadas e categorias personalizadas",
    cta: "Ver Planos",
    type: "internal",
  },
];

export const AdBanner = ({ variant = "horizontal", className = "" }: AdBannerProps) => {
  const { subscription, loading } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [currentAd] = useState(() => Math.floor(Math.random() * adContent.length));
  const navigate = useNavigate();
  const { trackImpression, trackClick, trackDismiss } = useAdAnalytics();

  const ad = adContent[currentAd];

  // Track impression on mount
  useEffect(() => {
    if (!loading && subscription?.plan_type !== "pro" && subscription?.plan_type !== "premium") {
      trackImpression(ad.id, variant);
    }
  }, [loading, subscription, ad.id, variant, trackImpression]);

  // Don't show ads for pro/premium users or while loading
  if (loading) return null;
  if (subscription?.plan_type === "pro" || subscription?.plan_type === "premium") return null;
  if (dismissed) return null;

  const handleClick = () => {
    trackClick(ad.id, variant);
    if (ad.type === "internal") {
      navigate("/#pricing");
    }
  };

  const handleDismiss = () => {
    trackDismiss(ad.id, variant);
    setDismissed(true);
  };

  if (variant === "horizontal") {
    return (
      <div className={`relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-border/50 rounded-lg p-4 ${className}`}>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar anúncio"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center justify-between gap-4 pr-6">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Anúncio</p>
            <h4 className="font-semibold text-foreground">{ad.title}</h4>
            <p className="text-sm text-muted-foreground">{ad.description}</p>
          </div>
          <Button onClick={handleClick} size="sm" className="shrink-0">
            {ad.cta}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className={`relative bg-gradient-to-b from-secondary/50 to-secondary/30 border border-border/50 rounded-lg p-4 ${className}`}>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar anúncio"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Anúncio</p>
        <h4 className="font-semibold text-foreground mb-1">{ad.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{ad.description}</p>
        <Button onClick={handleClick} size="sm" className="w-full">
          {ad.cta}
        </Button>
      </div>
    );
  }

  // inline variant
  return (
    <div className={`relative inline-flex items-center gap-3 bg-muted/50 border border-border/30 rounded-md px-3 py-2 ${className}`}>
      <span className="text-xs text-muted-foreground">Ad</span>
      <span className="text-sm text-foreground">{ad.title}</span>
      <Button onClick={handleClick} variant="link" size="sm" className="p-0 h-auto">
        {ad.cta}
      </Button>
      <button
        onClick={handleDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors ml-1"
        aria-label="Fechar"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};
