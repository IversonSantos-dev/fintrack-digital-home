import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Obrigado! Você receberá nossas novidades em breve.");
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section id="contato" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-hero rounded-3xl p-8 sm:p-12 shadow-strong animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card/20 backdrop-blur-sm mb-4">
                <Mail className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
                Receba Dicas Financeiras
              </h2>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                Cadastre-se e receba dicas exclusivas, novidades do app e conteúdos sobre 
                educação financeira direto no seu email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-card/90 backdrop-blur-sm border-primary-foreground/30 text-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="bg-secondary hover:bg-secondary-glow text-secondary-foreground shadow-medium hover:shadow-strong transition-smooth"
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Quero Receber
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-primary-foreground/70 text-center mt-4">
                Seus dados estão seguros. Não compartilhamos com terceiros.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
