import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Crown,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Subscription() {
  const { user, session } = useAuth();
  const { subscription, loading, refetch } = useSubscription();
  const navigate = useNavigate();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const planDetails = {
    free: {
      name: "Free",
      price: "R$ 0",
      color: "bg-muted",
      features: ["Até 3 contas", "Controle básico", "Relatórios mensais"]
    },
    pro: {
      name: "Pro",
      price: "R$ 19,90",
      color: "bg-primary",
      features: ["Contas ilimitadas", "Orçamentos inteligentes", "Relatórios personalizados", "Backup na nuvem"]
    },
    premium: {
      name: "Premium",
      price: "R$ 39,90",
      color: "bg-gradient-to-r from-primary to-secondary",
      features: ["Tudo do Pro +", "Análise de investimentos", "Consultoria financeira", "API para integrações"]
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("URL do portal não recebida");
      }
    } catch (error) {
      console.error("Erro ao abrir portal:", error);
      toast.error("Erro ao abrir portal de gerenciamento");
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast.success("Status da assinatura atualizado!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentPlan = subscription?.plan_type || "free";
  const plan = planDetails[currentPlan];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate("/app")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            
            <h1 className="text-xl font-heading font-bold text-foreground">
              Minha Assinatura
            </h1>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshSubscription}
              disabled={refreshing}
              title="Atualizar status"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Current Plan Card */}
          <Card className="p-8 border-2 border-primary/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className={`w-16 h-16 rounded-xl ${plan.color} flex items-center justify-center shadow-medium`}>
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
                    Plano {plan.name}
                  </h2>
                  <p className="text-3xl font-bold text-primary">
                    {plan.price}<span className="text-sm text-muted-foreground">/mês</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end space-y-2">
                <Badge 
                  variant={subscription?.status === "active" ? "default" : "secondary"}
                  className="text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {subscription?.status === "active" ? "Ativo" : subscription?.status || "Inativo"}
                </Badge>
                
                {subscription?.end_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    Renova em {format(new Date(subscription.end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Recursos inclusos:</h3>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {currentPlan !== "free" && (
              <>
                <Separator className="my-6" />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleManageSubscription}
                    disabled={loadingPortal}
                    className="flex-1"
                  >
                    {loadingPortal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Abrindo portal...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gerenciar Assinatura
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Outros Planos
                  </Button>
                </div>
              </>
            )}

            {currentPlan === "free" && (
              <>
                <Separator className="my-6" />
                
                <Button
                  onClick={() => navigate("/")}
                  className="w-full"
                  size="lg"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </>
            )}
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-muted/30">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">
                  Gerenciamento de Pagamento
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Através do portal de gerenciamento você pode:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Atualizar método de pagamento</li>
                  <li>Ver histórico de pagamentos e faturas</li>
                  <li>Fazer upgrade ou downgrade de plano</li>
                  <li>Cancelar assinatura a qualquer momento</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* User Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Informações da Conta</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{user?.email}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium text-foreground">
                  {user?.user_metadata?.full_name || "Não informado"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plano atual:</span>
                <Badge variant="outline">{plan.name}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
