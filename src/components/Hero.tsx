import { ArrowRight, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroMockup from "@/assets/hero-mockup.png";

export const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-hero opacity-90" />
      
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 leading-tight">
              Domine suas finanças com o Fintrack 💸
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto lg:mx-0">
              Controle seus gastos, crie orçamentos inteligentes e visualize relatórios detalhados. 
              Tudo em um só lugar, de forma simples e segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary-glow text-secondary-foreground shadow-strong hover:shadow-strong hover:scale-105 transition-smooth"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-card/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-card/20 shadow-medium"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver Funcionalidades
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary-foreground">50k+</div>
                <div className="text-sm text-primary-foreground/80">Usuários</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary-foreground">4.9</div>
                <div className="text-sm text-primary-foreground/80">Avaliação</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-primary-foreground">100%</div>
                <div className="text-sm text-primary-foreground/80">Seguro</div>
              </div>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative lg:ml-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative z-10 max-w-md mx-auto">
              <img
                src={heroMockup}
                alt="Fintrack App Interface"
                className="w-full h-auto drop-shadow-2xl animate-float"
              />
            </div>
            {/* Glow effect behind mockup */}
            <div className="absolute inset-0 bg-primary-glow/30 blur-3xl rounded-full scale-75" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowRight className="w-6 h-6 text-primary-foreground rotate-90" />
      </div>
    </section>
  );
};
