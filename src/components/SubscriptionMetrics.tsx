import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  proSubscriptions: number;
  premiumSubscriptions: number;
  freeUsers: number;
  monthlyRevenue: number;
  churnRate: number;
  growthRate: number;
}

interface ChartData {
  month: string;
  revenue: number;
  subscriptions: number;
}

const COLORS = ["#10B981", "#8B5CF6", "#6B7280"];

export function SubscriptionMetrics() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch all subscriptions
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*");

      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

      // Calculate stats
      const active = subscriptions?.filter(s => s.status === "active") || [];
      const pro = active.filter(s => s.plan_type === "pro");
      const premium = active.filter(s => s.plan_type === "premium");
      const free = active.filter(s => s.plan_type === "free");

      // Revenue calculation (mock prices: Pro = R$29.90, Premium = R$59.90)
      const monthlyRevenue = pro.length * 29.90 + premium.length * 59.90;

      // Calculate churn (cancelled in last 30 days vs active 30 days ago)
      const cancelled = subscriptions?.filter(s => s.status === "cancelled") || [];
      const churnRate = active.length > 0 
        ? ((cancelled.length / (active.length + cancelled.length)) * 100) 
        : 0;

      // Growth rate (new subscriptions this month)
      const thisMonthSubs = subscriptions?.filter(s => {
        const startDate = new Date(s.start_date);
        return startDate.getMonth() === currentMonth && s.plan_type !== "free";
      }) || [];

      const lastMonthSubs = subscriptions?.filter(s => {
        const startDate = new Date(s.start_date);
        return startDate.getMonth() === lastMonth && s.plan_type !== "free";
      }) || [];

      const growthRate = lastMonthSubs.length > 0 
        ? (((thisMonthSubs.length - lastMonthSubs.length) / lastMonthSubs.length) * 100)
        : thisMonthSubs.length > 0 ? 100 : 0;

      setStats({
        totalSubscriptions: subscriptions?.length || 0,
        activeSubscriptions: active.length,
        proSubscriptions: pro.length,
        premiumSubscriptions: premium.length,
        freeUsers: free.length,
        monthlyRevenue,
        churnRate: Math.round(churnRate * 10) / 10,
        growthRate: Math.round(growthRate * 10) / 10,
      });

      // Generate chart data (last 6 months)
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const chartDataArr: ChartData[] = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthSubs = subscriptions?.filter(s => {
          const startDate = new Date(s.start_date);
          return startDate.getMonth() === monthIndex && s.plan_type !== "free";
        }) || [];
        
        const monthRevenue = monthSubs.reduce((acc, s) => {
          return acc + (s.plan_type === "pro" ? 29.90 : s.plan_type === "premium" ? 59.90 : 0);
        }, 0);

        chartDataArr.push({
          month: months[monthIndex],
          revenue: monthRevenue,
          subscriptions: monthSubs.length,
        });
      }

      setChartData(chartDataArr);
    } catch (error) {
      console.error("Error fetching subscription metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const pieData = stats ? [
    { name: "Pro", value: stats.proSubscriptions },
    { name: "Premium", value: stats.premiumSubscriptions },
    { name: "Free", value: stats.freeUsers },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Métricas de Assinaturas</h2>
        <Button variant="outline" size="sm" onClick={fetchMetrics}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal
            </CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {stats?.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.proSubscriptions} Pro + {stats?.premiumSubscriptions} Premium
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {stats?.totalSubscriptions} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Crescimento
            </CardTitle>
            {(stats?.growthRate || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.growthRate || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {(stats?.growthRate || 0) >= 0 ? "+" : ""}{stats?.growthRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Cancelamento
            </CardTitle>
            <Users className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats?.churnRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">churn rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
            <CardDescription>Evolução da receita nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Receita"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>Usuários por tipo de plano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-sm text-muted-foreground">Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm text-muted-foreground">Free</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
