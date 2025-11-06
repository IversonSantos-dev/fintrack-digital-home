import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Calendar,
  Download
} from "lucide-react";

export default function Reports() {
  const monthlyData = [
    { month: "Jan", receitas: 4500, despesas: 2800 },
    { month: "Fev", receitas: 5200, despesas: 3100 },
    { month: "Mar", receitas: 4800, despesas: 2900 },
    { month: "Abr", receitas: 6100, despesas: 3400 },
    { month: "Mai", receitas: 5500, despesas: 3200 },
    { month: "Jun", receitas: 8500, despesas: 3247 },
  ];

  const categories = [
    { name: "Alimentação", value: 1200, color: "bg-primary" },
    { name: "Transporte", value: 450, color: "bg-secondary" },
    { name: "Moradia", value: 800, color: "bg-accent" },
    { name: "Lazer", value: 350, color: "bg-muted" },
    { name: "Outros", value: 447, color: "bg-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
              Relatórios Financeiros
            </h1>
            <p className="text-muted-foreground">
              Análise detalhada das suas finanças
            </p>
          </div>
          <Button className="gradient-primary shadow-medium">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Period Selector */}
        <Card className="p-4 border-border shadow-soft">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Mês Atual</Button>
              <Button variant="ghost" size="sm">Últimos 3 Meses</Button>
              <Button variant="ghost" size="sm">Últimos 6 Meses</Button>
              <Button variant="ghost" size="sm">Ano Atual</Button>
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
            <p className="text-2xl font-bold text-foreground">R$ 34.600,00</p>
            <p className="text-xs text-secondary mt-2">+18.5% vs período anterior</p>
          </Card>

          <Card className="p-6 border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
            <p className="text-2xl font-bold text-foreground">R$ 18.647,00</p>
            <p className="text-xs text-destructive mt-2">+12.3% vs período anterior</p>
          </Card>

          <Card className="p-6 border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Saldo Período</p>
            <p className="text-2xl font-bold text-foreground">R$ 15.953,00</p>
            <p className="text-xs text-secondary mt-2">+24.1% vs período anterior</p>
          </Card>

          <Card className="p-6 border-border shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Taxa de Economia</p>
            <p className="text-2xl font-bold text-foreground">46.1%</p>
            <p className="text-xs text-secondary mt-2">+5.2% vs período anterior</p>
          </Card>
        </div>

        {/* Monthly Trend Chart */}
        <Card className="p-6 border-border shadow-soft">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
            Evolução Mensal
          </h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{data.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-secondary">R$ {data.receitas.toLocaleString('pt-BR')}</span>
                    <span className="text-destructive">R$ {data.despesas.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="h-8 bg-muted rounded-lg overflow-hidden flex">
                  <div 
                    className="gradient-primary flex items-center justify-end pr-2 text-xs text-primary-foreground font-medium"
                    style={{ width: `${(data.receitas / 10000) * 100}%` }}
                  >
                    {data.receitas > 5000 && 'Receitas'}
                  </div>
                  <div 
                    className="bg-destructive/80 flex items-center justify-end pr-2 text-xs text-destructive-foreground font-medium"
                    style={{ width: `${(data.despesas / 10000) * 100}%` }}
                  >
                    {data.despesas > 3000 && 'Despesas'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6 border-border shadow-soft">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6">
            Despesas por Categoria
          </h2>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const total = categories.reduce((sum, cat) => sum + cat.value, 0);
              const percentage = ((category.value / total) * 100).toFixed(1);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{category.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">{percentage}%</span>
                      <span className="text-foreground font-semibold">
                        R$ {category.value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.color} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
