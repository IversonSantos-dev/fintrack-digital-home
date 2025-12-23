import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useRecurringTransactions = () => {
  const { user } = useAuth();
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurringTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_date', { ascending: true });

      if (error) throw error;
      setRecurringTransactions(data as RecurringTransaction[]);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRecurringTransaction = async (transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRecurringTransactions(prev => [...prev, data as RecurringTransaction]);
      toast({
        title: "Transação recorrente criada",
        description: "A transação será executada automaticamente.",
      });
      
      return { data };
    } catch (error: any) {
      console.error('Error creating recurring transaction:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const updateRecurringTransaction = async (id: string, updates: Partial<RecurringTransaction>) => {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRecurringTransactions(prev => 
        prev.map(t => t.id === id ? data as RecurringTransaction : t)
      );
      
      return { data };
    } catch (error: any) {
      console.error('Error updating recurring transaction:', error);
      return { error: error.message };
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRecurringTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Transação removida",
        description: "A transação recorrente foi excluída.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting recurring transaction:', error);
      return { error: error.message };
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateRecurringTransaction(id, { is_active: isActive });
  };

  useEffect(() => {
    fetchRecurringTransactions();
  }, [user]);

  return {
    recurringTransactions,
    loading,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleActive,
    refetch: fetchRecurringTransactions,
  };
};
