import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  color: string;
  icon: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useFinancialGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data as FinancialGoal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_completed'>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert({
          ...goal,
          user_id: user.id,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => [data as FinancialGoal, ...prev]);
      toast({
        title: "Meta criada",
        description: `Meta "${goal.name}" criada com sucesso!`,
      });
      
      return { data };
    } catch (error: any) {
      console.error('Error creating goal:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    try {
      // Check if goal is being completed
      const currentGoal = goals.find(g => g.id === id);
      const isBeingCompleted = updates.current_amount && currentGoal && 
        updates.current_amount >= currentGoal.target_amount;

      const { data, error } = await supabase
        .from('financial_goals')
        .update({
          ...updates,
          is_completed: isBeingCompleted || updates.is_completed,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prev => 
        prev.map(g => g.id === id ? data as FinancialGoal : g)
      );

      if (isBeingCompleted) {
        toast({
          title: "🎉 Meta alcançada!",
          description: `Parabéns! Você atingiu sua meta "${currentGoal?.name}"!`,
        });
      }
      
      return { data };
    } catch (error: any) {
      console.error('Error updating goal:', error);
      return { error: error.message };
    }
  };

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return { error: 'Goal not found' };

    const newAmount = goal.current_amount + amount;
    return updateGoal(id, { current_amount: newAmount });
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setGoals(prev => prev.filter(g => g.id !== id));
      toast({
        title: "Meta removida",
        description: "A meta foi excluída com sucesso.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    addToGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
};
