import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRecurringTransactions, RecurringTransaction } from "@/hooks/useRecurringTransactions";
import { RefreshCw, Plus, Trash2, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState as useStateAccounts } from "react";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export const RecurringTransactionsCard = () => {
  const { user } = useAuth();
  const { recurringTransactions, loading, createRecurringTransaction, deleteRecurringTransaction, toggleActive } = useRecurringTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accounts, setAccounts] = useStateAccounts<Account[]>([]);
  const [categories, setCategories] = useStateAccounts<Category[]>([]);
  
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    account_id: "",
    category_id: "",
    next_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      const [accountsRes, categoriesRes] = await Promise.all([
        supabase.from("accounts").select("id, name").eq("user_id", user.id),
        supabase.from("categories").select("id, name, type").eq("user_id", user.id),
      ]);
      
      if (accountsRes.data) setAccounts(accountsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    };
    
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createRecurringTransaction({
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      frequency: form.frequency,
      account_id: form.account_id,
      category_id: form.category_id || null,
      next_date: form.next_date,
      is_active: true,
    });
    
    setIsDialogOpen(false);
    setForm({
      description: "",
      amount: "",
      type: "expense",
      frequency: "monthly",
      account_id: "",
      category_id: "",
      next_date: new Date().toISOString().split("T")[0],
    });
  };

  const frequencyLabels: Record<string, string> = {
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
    yearly: "Anual",
  };

  const filteredCategories = categories.filter(c => c.type === form.type);

  if (loading) {
    return (
      <Card className="p-6 border-border shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Transações Recorrentes
          </h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Transação Recorrente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Aluguel, Salário..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v: "income" | "expense") => setForm({ ...form, type: v, category_id: "" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select value={form.frequency} onValueChange={(v: any) => setForm({ ...form, frequency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Próxima Data</Label>
                  <Input
                    type="date"
                    value={form.next_date}
                    onChange={e => setForm({ ...form, next_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select value={form.account_id} onValueChange={v => setForm({ ...form, account_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Categoria (opcional)</Label>
                <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full gradient-primary">
                Criar Transação Recorrente
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {recurringTransactions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma transação recorrente configurada.
        </p>
      ) : (
        <div className="space-y-3">
          {recurringTransactions.map(transaction => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Switch
                  checked={transaction.is_active}
                  onCheckedChange={checked => toggleActive(transaction.id, checked)}
                />
                <div>
                  <p className="font-medium text-foreground">
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{frequencyLabels[transaction.frequency]}</span>
                    <span>•</span>
                    <span>Próxima: {new Date(transaction.next_date).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`font-bold ${transaction.type === "income" ? "text-secondary" : "text-destructive"}`}>
                  {transaction.type === "income" ? "+" : "-"}R$ {Number(transaction.amount).toFixed(2)}
                </span>
                <Badge variant={transaction.is_active ? "default" : "secondary"}>
                  {transaction.is_active ? "Ativo" : "Pausado"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRecurringTransaction(transaction.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
