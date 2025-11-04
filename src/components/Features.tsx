import { Wallet, TrendingUp, Target, Shield, Cloud, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Features = () => {
  const features = [
    {
      icon: Wallet,
      title: "Controle de Contas",
      description: "Gerencie múltiplas contas bancárias e cartões em um único lugar.",
    },
    {
      icon: TrendingUp,
      title: "Relatórios Detalhados",
      description: "Visualize gráficos e análises completas dos seus gastos e receitas.",
    },
    {
      icon: Target,
      title: "Orçamentos Inteligentes",
      description: "Crie metas financeiras e receba alertas quando se aproximar dos limites.",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Criptografia AES-256 e autenticação de dois fatores para proteger seus dados.",
    },
    {
      icon: Cloud,
      title: "Backup Automático",
      description: "Seus dados sempre seguros na nuvem com sincronização em tempo real.",
    },
    {
      icon: Zap,
      title: "Rápido e Eficiente",
      description: "Interface intuitiva e velocidade impressionante para registro de transações.",
    },
  ];

  return (
    <section id="funcionalidades" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Funcionalidades Poderosas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para ter controle total das suas finanças pessoais
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 border-border hover:border-primary/50 transition-smooth shadow-soft hover:shadow-medium group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-2xl gradient-card flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
