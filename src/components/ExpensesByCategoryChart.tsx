import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PieChartIcon, Loader2 } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

interface CategoryExpense {
  name: string;
  value: number;
  color: string;
}

export function ExpensesByCategoryChart() {
  const { user } = useAuth();
  const [data, setData] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchExpensesByCategory = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const { data: transactions } = await supabase
          .from("transactions")
          .select(`
            amount,
            category:categories(name, color)
          `)
          .eq("user_id", user.id)
          .eq("type", "expense")
          .gte("date", monthStart.toISOString().split("T")[0])
          .lte("date", monthEnd.toISOString().split("T")[0]);

        if (!transactions || transactions.length === 0) {
          setData([]);
          setTotal(0);
          setLoading(false);
          return;
        }

        // Group by category
        const categoryMap = new Map<string, { value: number; color: string }>();

        transactions.forEach((t) => {
          const categoryName = (t.category as any)?.name || "Outros";
          const categoryColor = (t.category as any)?.color || "#6B7280";
          const amount = Number(t.amount);

          if (categoryMap.has(categoryName)) {
            const existing = categoryMap.get(categoryName)!;
            categoryMap.set(categoryName, { ...existing, value: existing.value + amount });
          } else {
            categoryMap.set(categoryName, { value: amount, color: categoryColor });
          }
        });

        const chartData: CategoryExpense[] = Array.from(categoryMap.entries())
          .map(([name, { value, color }]) => ({ name, value, color }))
          .sort((a, b) => b.value - a.value);

        setData(chartData);
        setTotal(chartData.reduce((sum, item) => sum + item.value, 0));
      } catch (error) {
        console.error("Error fetching expenses by category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesByCategory();
  }, [user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.color };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  if (loading) {
    return (
      <Card className="border-border shadow-soft">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-center">
            Nenhuma despesa registrada este mês
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <PieChartIcon className="w-5 h-5 text-primary" />
          Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Category List */}
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {data.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({((item.value / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
          {data.length > 5 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{data.length - 5} outras categorias
            </p>
          )}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total do mês</span>
          <span className="text-lg font-bold text-destructive">
            {formatCurrency(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
