import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { currencies, useCurrencyStore } from "@/stores/useCurrencyStore";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CurrencySelector() {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();

  const handleSelect = (selectedCurrency: typeof currencies[0]) => {
    setCurrency(selectedCurrency);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Alterar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar Moeda</DialogTitle>
          <DialogDescription>
            Escolha a moeda padrão para exibição de valores
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleSelect(curr)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border transition-smooth hover:bg-accent",
                currency.code === curr.code
                  ? "border-primary bg-accent"
                  : "border-border"
              )}
            >
              <div className="text-left">
                <div className="font-medium">{curr.name}</div>
                <div className="text-sm text-muted-foreground">
                  {curr.code} - {curr.symbol}
                </div>
              </div>
              {currency.code === curr.code && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
