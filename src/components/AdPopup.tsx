import { useSubscription } from "@/hooks/useSubscription";
import { X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAdAnalytics } from "@/hooks/useAdAnalytics";

interface AdPopupProps {
  delayMs?: number;
}

const popupContent = {
  id: "popup_upgrade",
  title: "Aproveite o máximo do app!",
  description: "Desbloqueie recursos avançados, remova anúncios e tenha controle total das suas finanças.",
  cta: "Ver Planos",
  features: ["Transações ilimitadas", "Relatórios avançados", "Sem anúncios"],
};

export const AdPopup = ({ delayMs = 30000 }: AdPopupProps) => {
  const { subscription, loading } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const navigate = useNavigate();
  const { trackImpression, trackClick, trackDismiss } = useAdAnalytics();

  useEffect(() => {
    // Check if already shown this session
    const shownThisSession = sessionStorage.getItem("popup_ad_shown");
    if (shownThisSession) {
      setHasShown(true);
      return;
    }

    // Don't show for pro/premium users
    if (loading) return;
    if (subscription?.plan_type === "pro" || subscription?.plan_type === "premium") return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasShown(true);
      sessionStorage.setItem("popup_ad_shown", "true");
      trackImpression(popupContent.id, "popup");
    }, delayMs);

    return () => clearTimeout(timer);
  }, [loading, subscription, delayMs, trackImpression]);

  const handleClose = () => {
    setIsVisible(false);
    trackDismiss(popupContent.id, "popup");
  };

  const handleClick = () => {
    trackClick(popupContent.id, "popup");
    navigate("/#pricing");
    setIsVisible(false);
  };

  if (!isVisible || hasShown && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-2">
            {popupContent.title}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {popupContent.description}
          </p>

          <ul className="text-left space-y-2 mb-6">
            {popupContent.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <Button onClick={handleClick} className="w-full" size="lg">
              {popupContent.cta}
            </Button>
            <button
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Talvez depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
