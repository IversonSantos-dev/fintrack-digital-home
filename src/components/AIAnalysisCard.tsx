import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const AIAnalysisCard = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-finances");
      
      if (error) {
        console.error("Error calling analyze-finances:", error);
        
        // Handle specific error codes
        if (error.message?.includes("402")) {
          toast({
            title: "Créditos insuficientes",
            description: "Por favor, adicione créditos ao seu workspace Lovable AI.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes("429")) {
          toast({
            title: "Limite de requisições",
            description: "Aguarde um momento e tente novamente.",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      setAnalysis(data.analysis);
      toast({
        title: "Análise concluída!",
        description: "Sua análise financeira foi gerada com sucesso.",
      });
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Erro ao gerar análise",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-border shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Análise com IA
          </h2>
        </div>
        
        <Button
          onClick={generateAnalysis}
          disabled={loading}
          className="gradient-primary"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {analysis ? "Atualizar" : "Gerar Análise"}
            </>
          )}
        </Button>
      </div>

      {!analysis && !loading && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full gradient-card flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-medium">Análise Financeira Inteligente</p>
            <p className="text-muted-foreground text-sm mt-1">
              Nossa IA vai analisar seus gastos, identificar padrões e sugerir melhorias personalizadas.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Analisando suas finanças...</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-4/5"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/5"></div>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {analysis.split('\n').map((paragraph, index) => {
              // Handle headers (lines starting with **)
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <h3 key={index} className="font-bold text-primary mt-4 mb-2 text-base">
                    {paragraph.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              
              // Handle bold text within paragraphs
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
              
              // Handle bullet points
              if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                return (
                  <li key={index} className="ml-4 mb-1">
                    {paragraph.replace(/^[-•]\s*/, '')}
                  </li>
                );
              }
              
              // Handle numbered lists
              if (/^\d+\./.test(paragraph.trim())) {
                return (
                  <li key={index} className="ml-4 mb-1">
                    {paragraph.replace(/^\d+\.\s*/, '')}
                  </li>
                );
              }
              
              // Regular paragraphs
              if (paragraph.trim()) {
                return <p key={index} className="mb-2">{paragraph}</p>;
              }
              
              return <br key={index} />;
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
