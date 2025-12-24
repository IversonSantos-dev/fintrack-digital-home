import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Conexão restaurada", {
        description: "Seus dados serão sincronizados automaticamente.",
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("Modo offline", {
        description: "Você está usando dados em cache.",
        duration: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-warning/90 text-warning-foreground px-4 py-2 rounded-full shadow-lg animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Modo Offline</span>
    </div>
  );
}
