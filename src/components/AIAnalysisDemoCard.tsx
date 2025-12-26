import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DEMO_ANALYSIS = `**📊 Resumo Financeiro**
Com base em uma análise de exemplo, identificamos padrões interessantes nas suas finanças.

**💡 Insights Principais**
- Seus gastos com alimentação representam cerca de 25% do orçamento
- Despesas fixas consomem aproximadamente 45% da renda
- Existe potencial de economia de até 15% com pequenos ajustes

**⚠️ Alertas**
- Gastos com entretenimento acima da média do mês anterior
- Categoria "Outros" precisa de melhor categorização

**✨ Recomendações**
1. Definir um limite mensal para gastos variáveis
2. Criar uma reserva de emergência
3. Revisar assinaturas recorrentes...

[Análise completa disponível no plano Pro]`;

export const AIAnalysisDemoCard = () => {
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  return (
    <Card className="p-6 border-border shadow-soft relative overflow-hidden">
      {/* Premium badge */}
      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Crown className="w-3 h-3" />
          Pro
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Análise com IA
          </h2>
        </div>
        
        {!showDemo && (
          <Button
            onClick={() => setShowDemo(true)}
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Ver Demonstração
          </Button>
        )}
      </div>

      {!showDemo && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full gradient-card flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-medium">Análise Financeira Inteligente</p>
            <p className="text-muted-foreground text-sm mt-1">
              Nossa IA analisa seus gastos, identifica padrões e sugere melhorias personalizadas.
            </p>
            <p className="text-primary text-sm mt-2 font-medium">
              Clique em "Ver Demonstração" para uma prévia!
            </p>
          </div>
        </div>
      )}

      {showDemo && (
        <div className="relative">
          {/* Blurred/faded demo content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {DEMO_ANALYSIS.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h3 key={index} className="font-bold text-primary mt-4 mb-2 text-base">
                      {paragraph.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                
                if (paragraph.includes('**')) {
                  const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={index} className="mb-2">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="text-primary">{part.replace(/\*\*/g, '')}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                }
                
                if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                  return (
                    <li key={index} className="ml-4 mb-1">
                      {paragraph.replace(/^[-•]\s*/, '')}
                    </li>
                  );
                }
                
                if (/^\d+\./.test(paragraph.trim())) {
                  return (
                    <li key={index} className="ml-4 mb-1">
                      {paragraph.replace(/^\d+\.\s*/, '')}
                    </li>
                  );
                }
                
                if (paragraph.trim()) {
                  return <p key={index} className="mb-2">{paragraph}</p>;
                }
                
                return <br key={index} />;
              })}
            </div>
          </div>

          {/* Gradient overlay with CTA */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-card via-card/95 to-transparent flex items-end justify-center pb-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Desbloqueie a análise completa</span>
              </div>
              <Button
                onClick={() => navigate("/")}
                className="gradient-primary"
              >
                <Crown className="w-4 h-4 mr-2" />
                Assinar Plano Pro
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
