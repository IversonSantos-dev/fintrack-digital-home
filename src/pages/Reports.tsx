import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Calendar,
  Download,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type PeriodFilter = "current" | "3months" | "6months" | "year";

export default function Reports() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("6months");
  
  const allMonthlyData = [
    { month: "Jan", receitas: 4500, despesas: 2800 },
    { month: "Fev", receitas: 5200, despesas: 3100 },
    { month: "Mar", receitas: 4800, despesas: 2900 },
    { month: "Abr", receitas: 6100, despesas: 3400 },
    { month: "Mai", receitas: 5500, despesas: 3200 },
    { month: "Jun", receitas: 8500, despesas: 3247 },
    { month: "Jul", receitas: 7200, despesas: 3100 },
    { month: "Ago", receitas: 6800, despesas: 2950 },
    { month: "Set", receitas: 7500, despesas: 3300 },
    { month: "Out", receitas: 6900, despesas: 3150 },
    { month: "Nov", receitas: 7800, despesas: 3400 },
    { month: "Dez", receitas: 8200, despesas: 3600 },
  ];

  const monthlyData = useMemo(() => {
    const currentMonth = new Date().getMonth(); // 0-11
    
    switch (selectedPeriod) {
      case "current":
        return [allMonthlyData[currentMonth]];
      case "3months":
        return allMonthlyData.slice(Math.max(0, currentMonth - 2), currentMonth + 1);
      case "6months":
        return allMonthlyData.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
      case "year":
        return allMonthlyData;
      default:
        return allMonthlyData;
    }
  }, [selectedPeriod]);

  const summary = useMemo(() => {
    const totalReceitas = monthlyData.reduce((acc, d) => acc + d.receitas, 0);
    const totalDespesas = monthlyData.reduce((acc, d) => acc + d.despesas, 0);
    const saldo = totalReceitas - totalDespesas;
    const taxaEconomia = totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(1) : "0.0";
    
    return { totalReceitas, totalDespesas, saldo, taxaEconomia };
  }, [monthlyData]);
  
  const monthlyData_old = [
    { month: "Jan", receitas: 4500, despesas: 2800 },
    { month: "Fev", receitas: 5200, despesas: 3100 },
    { month: "Mar", receitas: 4800, despesas: 2900 },
    { month: "Abr", receitas: 6100, despesas: 3400 },
    { month: "Mai", receitas: 5500, despesas: 3200 },
    { month: "Jun", receitas: 8500, despesas: 3247 },
  ];

  const categories = [
    { name: "Alimentação", value: 1200, fill: "hsl(var(--primary))" },
    { name: "Transporte", value: 450, fill: "hsl(var(--secondary))" },
    { name: "Moradia", value: 800, fill: "hsl(var(--accent))" },
    { name: "Lazer", value: 350, fill: "hsl(var(--chart-1))" },
    { name: "Outros", value: 447, fill: "hsl(var(--chart-2))" },
  ];

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "hsl(var(--primary))",
    },
    despesas: {
      label: "Despesas",
      color: "hsl(var(--destructive))",
    },
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/app")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                Relatórios Financeiros
              </h1>
              <p className="text-muted-foreground">
                Análise detalhada das suas finanças
              </p>
            </div>
          </div>
          <Button className="gradient-primary shadow-medium">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Period Selector */}
        <Card className="p-4 border-border shadow-soft">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <Button 
                variant={selectedPeriod === "current" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("current")}
                className={selectedPeriod === "current" ? "gradient-primary" : ""}
              >
                Mês Atual
              </Button>
              <Button 
                variant={selectedPeriod === "3months" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod("3months")}
                className={selectedPeriod === "3months" ? "gradient-primary" : ""}
              >
                Últimos 3 Meses
              </Button>
              <Button 
                variant={selectedPeriod === "6months" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod("6months")}
                className={selectedPeriod === "6months" ? "gradient-primary" : ""}
              >
                Últimos 6 Meses
              </Button>
              <Button 
                variant={selectedPeriod === "year" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod("year")}
                className={selectedPeriod === "year" ? "gradient-primary" : ""}
              >
                Ano Atual
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Receitas</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {summary.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-secondary mt-2">Período selecionado</p>
          </Card>

          <Card className="p-6 border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {summary.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Período selecionado</p>
          </Card>

          <Card className="p-6 border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Saldo Período</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-secondary mt-2">
              {summary.saldo >= 0 ? "Positivo" : "Negativo"}
            </p>
          </Card>

          <Card className="p-6 border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Taxa de Economia</p>
            <p className="text-2xl font-bold text-foreground">{summary.taxaEconomia}%</p>
            <p className="text-xs text-secondary mt-2">Do total de receitas</p>
          </Card>
        </div>

        {/* Monthly Trend Chart */}
        <Card className="p-6 border-border shadow-soft">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
            Evolução Mensal
          </h2>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar 
                  dataKey="receitas" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="despesas" 
                  fill="hsl(var(--destructive))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Category Breakdown - Pie Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border shadow-soft">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
              Despesas por Categoria
            </h2>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          <Card className="p-6 border-border shadow-soft">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
              Tendência de Saldo
            </h2>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData.map(d => ({
                  ...d,
                  saldo: d.receitas - d.despesas
                }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
