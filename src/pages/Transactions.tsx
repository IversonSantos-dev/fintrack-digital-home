import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdBanner } from "@/components/AdBanner";
import { TransactionFilters, TransactionFiltersState } from "@/components/TransactionFilters";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  description: string | null;
  amount: number;
  type: string;
  category: { name: string; color: string } | null;
  date: string;
  account: { name: string } | null;
}

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFiltersState>({
    type: "all",
    categoryId: null,
    accountId: null,
    dateFrom: null,
    dateTo: null,
    period: "all",
  });

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      setLoading(true);
      
      let query = supabase
        .from("transactions")
        .select(`
          id,
          description,
          amount,
          type,
          date,
          category:categories(name, color),
          account:accounts(name)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      // Apply filters
      if (filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters.accountId) {
        query = query.eq("account_id", filters.accountId);
      }
      if (filters.dateFrom) {
        query = query.gte("date", filters.dateFrom.toISOString().split("T")[0]);
      }
      if (filters.dateTo) {
        query = query.lte("date", filters.dateTo.toISOString().split("T")[0]);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data as Transaction[] || []);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [user, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/app")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Transações</h1>
              <p className="text-muted-foreground">
                Gerencie todas as suas movimentações financeiras
              </p>
            </div>
          </div>
          <Button className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        {/* Ad Banner for Free Users */}
        <AdBanner variant="horizontal" className="mb-6" />

        {/* Advanced Filters */}
        <TransactionFilters filters={filters} onFiltersChange={setFilters} />

        {/* Content with Sidebar Ad */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Transactions List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>
                  {transactions.length} transações encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "income" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {transaction.type === "income" ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {transaction.category?.name || "Sem categoria"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {transaction.account?.name || "Sem conta"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === "income" 
                            ? "text-green-500" 
                            : "text-red-500"
                        }`}>
                          {transaction.type === "income" ? "+" : "-"}
                          R$ {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Ad */}
          <div className="hidden lg:block">
            <AdBanner variant="sidebar" className="sticky top-6" />
          </div>
        </div>
      </div>
    </div>
  );
}