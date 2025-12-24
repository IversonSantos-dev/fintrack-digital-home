import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Loader2 } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChartDataPoint {
  month: string;
  balance: number;
  income: number;
  expense: number;
}

export function PatrimonyEvolutionChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEvolutionData = async () => {
      try {
        setLoading(true);
        const months: ChartDataPoint[] = [];
        let cumulativeBalance = 0;

        // Get data for the last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          const monthStart = startOfMonth(date);
          const monthEnd = endOfMonth(date);

          const { data: transactions } = await supabase
            .from("transactions")
            .select("amount, type")
            .eq("user_id", user.id)
            .gte("date", monthStart.toISOString().split("T")[0])
            .lte("date", monthEnd.toISOString().split("T")[0]);

          const income = transactions
            ?.filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          const expense = transactions
            ?.filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

          cumulativeBalance += income - expense;

          months.push({
            month: format(date, "MMM", { locale: ptBR }),
            balance: cumulativeBalance,
            income,
            expense,
          });
        }

        setChartData(months);
      } catch (error) {
        console.error("Error fetching evolution data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvolutionData();
  }, [user]);

  const chartConfig = {
    balance: {
      label: "Saldo",
      color: "hsl(var(--primary))",
    },
    income: {
      label: "Receitas",
      color: "hsl(var(--secondary))",
    },
    expense: {
      label: "Despesas",
      color: "hsl(var(--destructive))",
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="border-border shadow-soft">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TrendingUp className="w-5 h-5 text-primary" />
          Evolução Patrimonial
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground text-xs"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground text-xs"
                width={80}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                fill="url(#balanceGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--secondary))"
                fill="url(#incomeGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Saldo Atual</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(chartData[chartData.length - 1]?.balance || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Receitas (6 meses)</p>
            <p className="text-lg font-bold text-secondary">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.income, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Despesas (6 meses)</p>
            <p className="text-lg font-bold text-destructive">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.expense, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
