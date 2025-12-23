import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Budget {
  id: string;
  amount: number;
  category_id: string | null;
  start_date: string;
  end_date: string;
}

interface Transaction {
  amount: number;
  type: string;
  category_id: string | null;
  date: string;
}

export const useBudgetAlerts = () => {
  const { user } = useAuth();

  const checkBudgetAlerts = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (budgetsError) throw budgetsError;
      if (!budgets || budgets.length === 0) return;

      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense');

      if (transactionsError) throw transactionsError;

      // Fetch existing alerts
      const { data: existingAlerts, error: alertsError } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', user.id);

      if (alertsError) throw alertsError;

      const alertsSent = new Set(
        existingAlerts?.map(a => `${a.budget_id}-${a.alert_type}`) || []
      );

      // Check each budget
      for (const budget of budgets) {
        const budgetTransactions = (transactions || []).filter((t: Transaction) => {
          const transactionDate = new Date(t.date);
          const startDate = new Date(budget.start_date);
          const endDate = new Date(budget.end_date);
          
          const matchesCategory = !budget.category_id || t.category_id === budget.category_id;
          const matchesDate = transactionDate >= startDate && transactionDate <= endDate;
          
          return matchesCategory && matchesDate && t.type === 'expense';
        });

        const totalSpent = budgetTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
        const percentage = (totalSpent / Number(budget.amount)) * 100;

        // Check 80% warning
        if (percentage >= 80 && percentage < 100 && !alertsSent.has(`${budget.id}-warning_80`)) {
          await supabase.from('budget_alerts').insert({
            user_id: user.id,
            budget_id: budget.id,
            alert_type: 'warning_80',
          });

          toast({
            title: "⚠️ Alerta de Orçamento",
            description: `Você atingiu 80% do orçamento! (R$ ${totalSpent.toFixed(2)} de R$ ${Number(budget.amount).toFixed(2)})`,
            variant: "destructive",
          });
        }

        // Check 100% limit
        if (percentage >= 100 && !alertsSent.has(`${budget.id}-limit_100`)) {
          await supabase.from('budget_alerts').insert({
            user_id: user.id,
            budget_id: budget.id,
            alert_type: 'limit_100',
          });

          toast({
            title: "🚨 Limite Atingido!",
            description: `Você atingiu 100% do orçamento! (R$ ${totalSpent.toFixed(2)} de R$ ${Number(budget.amount).toFixed(2)})`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  }, [user]);

  // Check alerts on mount and when user changes
  useEffect(() => {
    checkBudgetAlerts();
  }, [checkBudgetAlerts]);

  // Subscribe to transaction changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('budget-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkBudgetAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, checkBudgetAlerts]);

  return { checkBudgetAlerts };
};
