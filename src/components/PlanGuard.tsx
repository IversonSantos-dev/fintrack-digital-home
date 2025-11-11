import { ReactNode } from "react";
import { useSubscription, PlanType } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanGuardProps {
  children: ReactNode;
  requiredPlan: PlanType;
  fallback?: ReactNode;
}

export const PlanGuard = ({ children, requiredPlan, fallback }: PlanGuardProps) => {
  const { hasFeatureAccess, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!hasFeatureAccess(requiredPlan)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="p-8 text-center">
        <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-2xl font-heading font-bold mb-2">
          Recurso Bloqueado
        </h3>
        <p className="text-muted-foreground mb-6">
          Este recurso está disponível apenas no plano{" "}
          <span className="font-semibold text-primary capitalize">
            {requiredPlan}
          </span>{" "}
          ou superior.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="gradient-primary"
        >
          Ver Planos
        </Button>
      </Card>
    );
  }

  return <>{children}</>;
};
