import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show after a small delay
      setTimeout(() => setShowConsent(true), 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-right">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-strong p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-foreground mb-1">
                Cookies e Privacidade
              </h3>
              <p className="text-sm text-muted-foreground">
                Usamos cookies para melhorar sua experiência. Ao continuar navegando, 
                você concorda com nossa{" "}
                <a href="#" className="text-primary hover:underline">
                  Política de Privacidade
                </a>{" "}
                e está de acordo com a LGPD.
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={declineCookies}
                className="border-border hover:bg-muted"
              >
                Recusar
              </Button>
              <Button
                size="sm"
                onClick={acceptCookies}
                className="gradient-primary shadow-medium"
              >
                Aceitar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
