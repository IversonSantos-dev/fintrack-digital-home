import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const Pricing = () => {
  const { user } = useAuth();
  const { subscription, upgradePlan, loading } = useSubscription();
  const navigate = useNavigate();
  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para começar a organizar suas finanças",
      features: [
        "Até 3 contas bancárias",
        "Controle básico de gastos",
        "Relatórios mensais",
        "Suporte por email",
      ],
      cta: "Começar Grátis",
      popular: false,
    },
    {
      name: "Pro",
      price: "R$ 19,90",
      period: "/mês",
      description: "Para quem quer controle total das finanças",
      features: [
        "Contas ilimitadas",
        "Orçamentos inteligentes",
        "Relatórios personalizados",
        "Backup na nuvem",
        "Suporte prioritário",
        "Sem anúncios",
      ],
      cta: "Assinar Pro",
      popular: true,
    },
    {
      name: "Premium",
      price: "R$ 39,90",
      period: "/mês",
      description: "Solução completa para investidores",
      features: [
        "Tudo do Pro +",
        "Análise de investimentos",
        "Consultoria financeira",
        "Acesso antecipado",
        "Suporte 24/7",
        "API para integrações",
      ],
      cta: "Assinar Premium",
      popular: false,
    },
  ];

  return (
    <section id="planos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Planos e Preços
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades financeiras
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 border-border hover:border-primary/50 transition-smooth shadow-soft hover:shadow-medium animate-fade-in-up ${
                plan.popular
                  ? "border-primary border-2 shadow-medium scale-105 md:scale-110"
                  : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold flex items-center space-x-1 shadow-medium">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Mais Popular</span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? "gradient-primary shadow-medium hover:shadow-strong"
                    : "bg-card text-foreground border border-border hover:bg-muted"
                } transition-smooth`}
                onClick={async () => {
                  if (!user) {
                    toast.info("Faça login para assinar um plano");
                    navigate("/auth");
                    return;
                  }

                  if (plan.name === "Free") {
                    navigate("/app");
                    return;
                  }

                  const planType = plan.name.toLowerCase() as "pro" | "premium";
                  const success = await upgradePlan(planType, 1);
                  
                  if (success) {
                    navigate("/app");
                  }
                }}
                disabled={loading || (subscription?.plan_type === plan.name.toLowerCase() && subscription?.status === "active")}
              >
                {subscription?.plan_type === plan.name.toLowerCase() && subscription?.status === "active"
                  ? "Plano Atual"
                  : plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
