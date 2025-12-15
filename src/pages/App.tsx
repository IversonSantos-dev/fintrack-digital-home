import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  CreditCard
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TransactionDialog } from "@/components/TransactionDialog";
import { AdBanner } from "@/components/AdBanner";
import { AdPopup } from "@/components/AdPopup";

export default function AppDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"income" | "expense" | "account" | "budget">("income");
  const navigate = useNavigate();

  const openDialog = (type: "income" | "expense" | "account" | "budget") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const stats = [
    {
      label: "Saldo Total",
      value: "R$ 5.847,32",
      icon: Wallet,
      change: "+12.5%",
      positive: true,
    },
    {
      label: "Receitas (mês)",
      value: "R$ 8.500,00",
      icon: TrendingUp,
      change: "+5.2%",
      positive: true,
    },
    {
      label: "Despesas (mês)",
      value: "R$ 3.247,68",
      icon: TrendingDown,
      change: "-8.1%",
      positive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Menu Mobile */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 text-foreground hover:text-primary transition-smooth"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-medium">
                  <span className="text-primary-foreground font-bold text-xl">F</span>
                </div>
                <span className="font-heading font-bold text-xl text-foreground hidden sm:block">
                  Fintrack
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end space-x-2">
                  <p className="text-sm font-medium text-foreground">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  {isAdmin && (
                    <Badge variant="default" className="gradient-primary text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="rounded-full"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-30 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/app")}
          >
            <Wallet className="w-5 h-5 mr-3" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/app/transactions")}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            Transações
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/app/reports")}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Relatórios
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/app/settings")}
          >
            <Settings className="w-5 h-5 mr-3" />
            Configurações
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/app/subscription")}
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Assinatura
          </Button>
          
          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Administração
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-primary"
                onClick={() => navigate("/app/admin")}
              >
                <Shield className="w-5 h-5 mr-3" />
                Painel Admin
              </Button>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Ad Banner for Free Users */}
          <AdBanner variant="horizontal" />

          {/* Popup Ad for Free Users (shows after 30s) */}
          <AdPopup delayMs={30000} />

          {/* Welcome */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
              Bem-vindo ao Fintrack! 👋
            </h1>
            <p className="text-muted-foreground">
              Aqui está um resumo das suas finanças
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="p-6 border-border hover:border-primary/50 transition-smooth shadow-soft hover:shadow-medium"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        stat.positive ? "text-secondary" : "text-destructive"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="p-6 border-border shadow-soft">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
              Ações Rápidas
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="gradient-primary shadow-medium"
                onClick={() => openDialog("income")}
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Receita
              </Button>
              <Button 
                variant="outline"
                onClick={() => openDialog("expense")}
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Despesa
              </Button>
              <Button 
                variant="outline"
                onClick={() => openDialog("account")}
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Conta
              </Button>
              <Button 
                variant="outline"
                onClick={() => openDialog("budget")}
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Orçamento
              </Button>
            </div>
          </Card>

          <TransactionDialog 
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            type={dialogType}
          />

          {/* Recent Transactions */}
          <Card className="p-6 border-border shadow-soft">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
              Transações Recentes
            </h2>
            <div className="space-y-4">
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação ainda. Adicione sua primeira transação acima!
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
