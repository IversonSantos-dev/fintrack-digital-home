import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense" | "account" | "budget";
}

interface Category {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
}

export function TransactionDialog({ open, onOpenChange, type }: TransactionDialogProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState("monthly");
  const [accountType, setAccountType] = useState("checking");
  const [loading, setLoading] = useState(false);

  // Data from database
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const titles = {
    income: "Nova Receita",
    expense: "Nova Despesa",
    account: "Nova Conta",
    budget: "Novo Orçamento"
  };

  const descriptions = {
    income: "Adicione uma nova receita ao seu controle financeiro",
    expense: "Registre uma nova despesa",
    account: "Crie uma nova conta bancária",
    budget: "Defina um novo orçamento"
  };

  const accountTypes = [
    { value: "checking", label: "Conta Corrente" },
    { value: "savings", label: "Poupança" },
    { value: "investment", label: "Investimentos" },
    { value: "cash", label: "Carteira" },
    { value: "credit", label: "Cartão de Crédito" },
  ];

  const periods = [
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensal" },
    { value: "yearly", label: "Anual" },
  ];

  // Fetch categories and accounts when dialog opens
  useEffect(() => {
    if (!open || !user) return;

    const fetchData = async () => {
      // Fetch categories based on type
      if (type === "income" || type === "expense") {
        const { data: cats } = await supabase
          .from("categories")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("type", type);
        setCategories(cats || []);
      }

      // Fetch accounts for transactions and budgets
      if (type === "income" || type === "expense" || type === "budget") {
        const { data: accs } = await supabase
          .from("accounts")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("is_active", true);
        setAccounts(accs || []);
        
        // Set default account
        if (accs && accs.length > 0 && !accountId) {
          setAccountId(accs[0].id);
        }
      }
    };

    fetchData();
  }, [open, user, type]);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategoryId("");
    setAccountId("");
    setDate(new Date().toISOString().split('T')[0]);
    setPeriod("monthly");
    setAccountType("checking");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para adicionar dados.");
      return;
    }

    setLoading(true);

    try {
      if (type === "income" || type === "expense") {
        // Create transaction
        if (!accountId) {
          toast.error("Selecione uma conta.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.from("transactions").insert({
          user_id: user.id,
          account_id: accountId,
          category_id: categoryId || null,
          description,
          amount: parseFloat(amount),
          type,
          date,
        });

        if (error) throw error;

        // Update account balance
        const { data: account } = await supabase
          .from("accounts")
          .select("balance")
          .eq("id", accountId)
          .single();

        const currentBalance = Number(account?.balance || 0);
        const newBalance = type === "income" 
          ? currentBalance + parseFloat(amount)
          : currentBalance - parseFloat(amount);

        await supabase
          .from("accounts")
          .update({ balance: newBalance })
          .eq("id", accountId);

      } else if (type === "account") {
        // Create account
        const { error } = await supabase.from("accounts").insert({
          user_id: user.id,
          name: description,
          type: accountType,
          balance: 0,
          is_active: true,
        });

        if (error) throw error;

      } else if (type === "budget") {
        // Create budget
        const startDate = new Date();
        let endDate = new Date();
        
        if (period === "weekly") {
          endDate.setDate(endDate.getDate() + 7);
        } else if (period === "monthly") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const { error } = await supabase.from("budgets").insert({
          user_id: user.id,
          category_id: categoryId || null,
          amount: parseFloat(amount),
          period,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        });

        if (error) throw error;
      }

      toast.success(`${titles[type]} adicionada com sucesso!`);
      resetForm();
      onOpenChange(false);

    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
          <DialogDescription>{descriptions[type]}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              {type === "account" ? "Nome da Conta" : "Descrição"}
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "account" ? "Ex: Nubank" : "Ex: Salário mensal"}
              required
            />
          </div>

          {type !== "account" && (
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          )}

          {type === "account" && (
            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Conta</Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === "income" || type === "expense") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="account">Conta</Label>
                <Select value={accountId} onValueChange={setAccountId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {type === "budget" && (
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
