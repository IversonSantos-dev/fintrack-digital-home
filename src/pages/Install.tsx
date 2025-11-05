import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Smartphone, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  const steps = [
    {
      title: "No Android",
      steps: [
        "Abra o menu do navegador (três pontos)",
        "Toque em 'Adicionar à tela inicial' ou 'Instalar app'",
        "Confirme a instalação",
      ],
    },
    {
      title: "No iPhone/iPad",
      steps: [
        "Toque no botão Compartilhar (quadrado com seta)",
        "Role para baixo e toque em 'Adicionar à Tela de Início'",
        "Toque em 'Adicionar'",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-strong">
              <span className="text-primary-foreground font-bold text-3xl">F</span>
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Instalar Fintrack
          </h1>
          <p className="text-muted-foreground">
            Instale o app na tela inicial do seu dispositivo para acesso rápido
          </p>
        </div>

        {isInstalled ? (
          <Card className="p-8 text-center gradient-card border-primary/20">
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              App Instalado! 🎉
            </h2>
            <p className="text-muted-foreground mb-6">
              O Fintrack foi instalado com sucesso na tela inicial do seu dispositivo
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/app")}
              className="gradient-primary shadow-medium"
            >
              Abrir Fintrack
            </Button>
          </Card>
        ) : (
          <>
            {/* Install Button (if available) */}
            {deferredPrompt && (
              <Card className="p-8 mb-8 gradient-hero text-center">
                <Smartphone className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-heading font-bold text-primary-foreground mb-2">
                  Instalar Agora
                </h2>
                <p className="text-primary-foreground/90 mb-6">
                  Clique no botão abaixo para instalar o Fintrack
                </p>
                <Button
                  size="lg"
                  onClick={handleInstall}
                  className="bg-secondary hover:bg-secondary-glow text-secondary-foreground shadow-strong"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Instalar App
                </Button>
              </Card>
            )}

            {/* Manual Installation Steps */}
            <div className="space-y-6">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Como Instalar Manualmente
              </h2>
              
              {steps.map((section, index) => (
                <Card key={index} className="p-6 border-border shadow-soft">
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                    {section.title}
                  </h3>
                  <ol className="space-y-3">
                    {section.steps.map((step, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {i + 1}
                        </span>
                        <span className="text-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Card>
              ))}
            </div>

            {/* Features */}
            <Card className="p-6 mt-8 border-border shadow-soft">
              <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                Vantagens do App Instalado
              </h3>
              <ul className="space-y-3">
                {[
                  "Acesso rápido pela tela inicial",
                  "Funciona offline",
                  "Experiência como app nativo",
                  "Sem precisar abrir o navegador",
                  "Atualizações automáticas",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
