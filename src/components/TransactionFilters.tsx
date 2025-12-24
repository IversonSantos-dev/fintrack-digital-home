import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Calendar as CalendarIcon, X, TrendingUp, TrendingDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Account {
  id: string;
  name: string;
}

export interface TransactionFiltersState {
  type: "all" | "income" | "expense";
  categoryId: string | null;
  accountId: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  period: string;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
}

const PERIOD_OPTIONS = [
  { value: "all", label: "Todo período" },
  { value: "this_month", label: "Este mês" },
  { value: "last_month", label: "Mês passado" },
  { value: "last_3_months", label: "Últimos 3 meses" },
  { value: "last_6_months", label: "Últimos 6 meses" },
  { value: "this_year", label: "Este ano" },
  { value: "custom", label: "Personalizado" },
];

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [categoriesRes, accountsRes] = await Promise.all([
        supabase.from("categories").select("id, name, type, color").eq("user_id", user.id),
        supabase.from("accounts").select("id, name").eq("user_id", user.id),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data);
    };

    fetchData();
  }, [user]);

  const handlePeriodChange = (period: string) => {
    let dateFrom: Date | null = null;
    let dateTo: Date | null = null;

    const now = new Date();

    switch (period) {
      case "this_month":
        dateFrom = startOfMonth(now);
        dateTo = endOfMonth(now);
        break;
      case "last_month":
        dateFrom = startOfMonth(subMonths(now, 1));
        dateTo = endOfMonth(subMonths(now, 1));
        break;
      case "last_3_months":
        dateFrom = startOfMonth(subMonths(now, 2));
        dateTo = endOfMonth(now);
        break;
      case "last_6_months":
        dateFrom = startOfMonth(subMonths(now, 5));
        dateTo = endOfMonth(now);
        break;
      case "this_year":
        dateFrom = new Date(now.getFullYear(), 0, 1);
        dateTo = new Date(now.getFullYear(), 11, 31);
        break;
      case "custom":
        setShowCustomDates(true);
        break;
    }

    if (period !== "custom") {
      setShowCustomDates(false);
    }

    onFiltersChange({ ...filters, period, dateFrom, dateTo });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      categoryId: null,
      accountId: null,
      dateFrom: null,
      dateTo: null,
      period: "all",
    });
    setShowCustomDates(false);
  };

  const activeFiltersCount = [
    filters.type !== "all",
    filters.categoryId !== null,
    filters.accountId !== null,
    filters.period !== "all",
  ].filter(Boolean).length;

  const filteredCategories = filters.type === "all" 
    ? categories 
    : categories.filter(c => c.type === filters.type);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={filters.type === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, type: "all", categoryId: null })}
            >
              Todas
            </Button>
            <Button
              variant={filters.type === "income" ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, type: "income", categoryId: null })}
              className={filters.type === "income" ? "bg-secondary hover:bg-secondary/90" : ""}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Receitas
            </Button>
            <Button
              variant={filters.type === "expense" ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, type: "expense", categoryId: null })}
              className={filters.type === "expense" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Despesas
            </Button>
          </div>

          {/* Period Select */}
          <Select value={filters.period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Select */}
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, categoryId: value === "all" ? null : value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Account Select */}
          <Select
            value={filters.accountId || "all"}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, accountId: value === "all" ? null : value })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Pickers */}
          {showCustomDates && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {filters.dateFrom
                      ? format(filters.dateFrom, "dd/MM/yyyy", { locale: ptBR })
                      : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom || undefined}
                    onSelect={(date) =>
                      onFiltersChange({ ...filters, dateFrom: date || null })
                    }
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {filters.dateTo
                      ? format(filters.dateTo, "dd/MM/yyyy", { locale: ptBR })
                      : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo || undefined}
                    onSelect={(date) =>
                      onFiltersChange({ ...filters, dateTo: date || null })
                    }
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpar ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
