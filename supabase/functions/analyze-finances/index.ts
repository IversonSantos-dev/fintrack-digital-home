import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    console.log("Fetching financial data for user:", user.id);

    // Fetch transactions from last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions, error: transError } = await supabase
      .from("transactions")
      .select(`
        *,
        categories(name)
      `)
      .eq("user_id", user.id)
      .gte("date", threeMonthsAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (transError) {
      console.error("Error fetching transactions:", transError);
      throw transError;
    }

    // Fetch accounts
    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id);

    if (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      throw accountsError;
    }

    // Fetch budgets
    const { data: budgets, error: budgetsError } = await supabase
      .from("budgets")
      .select(`
        *,
        categories(name)
      `)
      .eq("user_id", user.id);

    if (budgetsError) {
      console.error("Error fetching budgets:", budgetsError);
      throw budgetsError;
    }

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_completed", false);

    if (goalsError) {
      console.error("Error fetching goals:", goalsError);
      throw goalsError;
    }

    // Calculate statistics
    const totalIncome = transactions
      ?.filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    
    const totalExpenses = transactions
      ?.filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance || 0), 0) || 0;

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    transactions?.filter(t => t.type === "expense").forEach(t => {
      const categoryName = t.categories?.name || "Sem categoria";
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + Number(t.amount);
    });

    // Sort by value and get top 5
    const topCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => `${name}: R$ ${value.toFixed(2)}`);

    // Prepare context for AI
    const financialContext = `
Dados Financeiros do Usuário (últimos 3 meses):

RESUMO GERAL:
- Saldo total em contas: R$ ${totalBalance.toFixed(2)}
- Total de receitas: R$ ${totalIncome.toFixed(2)}
- Total de despesas: R$ ${totalExpenses.toFixed(2)}
- Economia/Déficit: R$ ${(totalIncome - totalExpenses).toFixed(2)}
- Taxa de economia: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%

TOP 5 CATEGORIAS DE GASTOS:
${topCategories.join("\n")}

CONTAS:
${accounts?.map(a => `- ${a.name} (${a.type}): R$ ${Number(a.balance || 0).toFixed(2)}`).join("\n") || "Nenhuma conta cadastrada"}

ORÇAMENTOS ATIVOS:
${budgets?.map(b => `- ${b.categories?.name || "Geral"}: R$ ${Number(b.amount).toFixed(2)}`).join("\n") || "Nenhum orçamento definido"}

METAS FINANCEIRAS EM ANDAMENTO:
${goals?.map(g => `- ${g.name}: R$ ${Number(g.current_amount).toFixed(2)} de R$ ${Number(g.target_amount).toFixed(2)} (${(Number(g.current_amount) / Number(g.target_amount) * 100).toFixed(0)}%)`).join("\n") || "Nenhuma meta definida"}

TRANSAÇÕES RECENTES (últimas 10):
${transactions?.slice(0, 10).map(t => `- ${t.date}: ${t.type === "income" ? "+" : "-"}R$ ${Number(t.amount).toFixed(2)} - ${t.description || t.categories?.name || "Sem descrição"}`).join("\n") || "Nenhuma transação"}
`;

    console.log("Calling Lovable AI for analysis...");

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um consultor financeiro pessoal especializado em finanças brasileiras. 
Analise os dados financeiros do usuário e forneça:

1. **Análise da Situação Atual** - Uma avaliação clara da saúde financeira
2. **Padrões Identificados** - Tendências de gastos e comportamentos financeiros
3. **Pontos de Atenção** - Áreas que precisam de cuidado
4. **Recomendações Práticas** - 3-5 dicas específicas e acionáveis
5. **Próximos Passos** - O que o usuário deve fazer esta semana

Use linguagem clara, amigável e motivadora. Seja específico com números quando possível.
Responda em português brasileiro.`,
          },
          {
            role: "user",
            content: `Por favor, analise minha situação financeira e me dê recomendações:\n\n${financialContext}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Não foi possível gerar a análise.";

    console.log("Analysis generated successfully");

    return new Response(
      JSON.stringify({
        analysis,
        summary: {
          totalBalance,
          totalIncome,
          totalExpenses,
          savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : "0",
          topCategories: expensesByCategory,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-finances:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
