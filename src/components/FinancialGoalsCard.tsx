import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign } from "lucide-react";

export const FinancialGoalsCard = () => {
  const { goals, loading, createGoal, addToGoal, deleteGoal } = useFinancialGoals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addAmountDialog, setAddAmountDialog] = useState<{ open: boolean; goalId: string; goalName: string }>({
    open: false,
    goalId: "",
    goalName: "",
  });
  const [addAmount, setAddAmount] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    current_amount: "0",
    deadline: "",
    color: "#10B981",
    icon: "target",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createGoal({
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      deadline: form.deadline || null,
      color: form.color,
      icon: form.icon,
    });
    
    setIsDialogOpen(false);
    setForm({
      name: "",
      target_amount: "",
      current_amount: "0",
      deadline: "",
      color: "#10B981",
      icon: "target",
    });
  };

  const handleAddAmount = async () => {
    if (!addAmount || !addAmountDialog.goalId) return;
    
    await addToGoal(addAmountDialog.goalId, parseFloat(addAmount));
    setAddAmountDialog({ open: false, goalId: "", goalName: "" });
    setAddAmount("");
  };

  const colorOptions = [
    { value: "#10B981", label: "Verde" },
    { value: "#3B82F6", label: "Azul" },
    { value: "#8B5CF6", label: "Roxo" },
    { value: "#F59E0B", label: "Amarelo" },
    { value: "#EC4899", label: "Rosa" },
    { value: "#EF4444", label: "Vermelho" },
  ];

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
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Metas Financeiras
          </h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Meta Financeira</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Meta</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Reserva de emergência, Viagem..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Alvo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.target_amount}
                    onChange={e => setForm({ ...form, target_amount: e.target.value })}
                    placeholder="10000.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Valor Inicial (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.current_amount}
                    onChange={e => setForm({ ...form, current_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prazo (opcional)</Label>
                  <Input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex space-x-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setForm({ ...form, color: color.value })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          form.color === color.value ? "border-foreground scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full gradient-primary">
                Criar Meta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Amount Dialog */}
      <Dialog open={addAmountDialog.open} onOpenChange={(open) => setAddAmountDialog({ ...addAmountDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar valor à meta: {addAmountDialog.goalName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Valor a adicionar (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
            <Button onClick={handleAddAmount} className="w-full gradient-primary">
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {goals.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma meta financeira definida. Crie sua primeira meta!
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const remaining = goal.target_amount - goal.current_amount;
            
            return (
              <div
                key={goal.id}
                className="p-4 bg-muted/50 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{goal.name}</p>
                      {goal.deadline && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddAmountDialog({ open: true, goalId: goal.id, goalName: goal.name })}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      R$ {goal.current_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-foreground font-medium">
                      R$ {goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" style={{ "--progress-color": goal.color } as any} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% concluído</span>
                    {remaining > 0 && <span>Faltam R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                    {goal.is_completed && (
                      <span className="text-secondary font-medium flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Meta alcançada!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
