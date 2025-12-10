import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Shield, Activity, Database, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PlanGuard } from "@/components/PlanGuard";
import { SubscriptionMetrics } from "@/components/SubscriptionMetrics";

export default function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin, loading } = useRole();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/app");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Mock data - será substituído por dados reais do Supabase
  const stats = [
    {
      title: "Total de Usuários",
      value: "1,234",
      icon: Users,
      trend: "+12%",
      description: "vs. mês anterior"
    },
    {
      title: "Transações Hoje",
      value: "89",
      icon: Activity,
      trend: "+5%",
      description: "vs. ontem"
    },
    {
      title: "Volume Total",
      value: "R$ 45.2K",
      icon: Database,
      trend: "+18%",
      description: "este mês"
    }
  ];

  const recentUsers = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@example.com",
      role: "user",
      createdAt: "2025-11-05"
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      role: "user",
      createdAt: "2025-11-04"
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@example.com",
      role: "admin",
      createdAt: "2025-11-03"
    }
  ];

  return (
    <PlanGuard requiredPlan="premium">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/app")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Painel Admin</h1>
                <p className="text-muted-foreground">
                  Gerencie usuários e monitore o sistema
                </p>
              </div>
            </div>
          </div>

          {/* Admin Badge */}
          <Badge className="gradient-primary">
            <Shield className="w-3 h-3 mr-1" />
            Acesso Administrativo
          </Badge>
        </div>

        {/* Security Warning */}
        <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  Área Administrativa Protegida
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Todas as ações nesta área são registradas e requerem validação no servidor.
                  Use com responsabilidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500 font-medium">{stat.trend}</span>{" "}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Recentes</CardTitle>
              <CardDescription>
                Últimos usuários cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Administrativas</CardTitle>
              <CardDescription>
                Ferramentas de gerenciamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Usuários
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Atribuir Roles
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Logs do Sistema
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Estatísticas Gerais
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Metrics Dashboard */}
        <div className="mt-8">
          <SubscriptionMetrics />
        </div>
      </div>
      </div>
    </PlanGuard>
  );
}
