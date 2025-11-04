import { Shield, Lock, Eye, Server } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Security = () => {
  const features = [
    {
      icon: Shield,
      title: "Criptografia AES-256",
      description: "Seus dados são protegidos com o mais alto padrão de segurança militar.",
    },
    {
      icon: Lock,
      title: "Autenticação 2FA",
      description: "Camada adicional de proteção com verificação em duas etapas.",
    },
    {
      icon: Eye,
      title: "Privacidade Garantida",
      description: "Seus dados nunca são compartilhados com terceiros. LGPD compliant.",
    },
    {
      icon: Server,
      title: "Backup Seguro",
      description: "Backups automáticos em servidores seguros e redundantes.",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Segurança e Privacidade
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seus dados financeiros merecem a melhor proteção. Estamos em conformidade com a LGPD.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 text-center border-border hover:border-primary/50 transition-smooth shadow-soft hover:shadow-medium group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-smooth">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* LGPD Notice */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="p-8 gradient-card border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                Comprometidos com sua Privacidade
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Respeitamos sua privacidade e estamos em total conformidade com a 
                Lei Geral de Proteção de Dados (LGPD). Você tem controle total sobre 
                seus dados e pode solicitar acesso, correção ou exclusão a qualquer momento.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
