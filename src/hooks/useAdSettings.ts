import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdSettings {
  internal_ad_ratio: number;
  adsense_enabled: boolean;
  adsense_slot_horizontal: string;
  adsense_slot_sidebar: string;
  popup_delay_seconds: number;
  popup_enabled: boolean;
}

const defaultSettings: AdSettings = {
  internal_ad_ratio: 50,
  adsense_enabled: true,
  adsense_slot_horizontal: "",
  adsense_slot_sidebar: "",
  popup_delay_seconds: 30,
  popup_enabled: true,
};

export const useAdSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["ad-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      const settingsMap: AdSettings = { ...defaultSettings };
      
      data?.forEach((row) => {
        const key = row.setting_key as keyof AdSettings;
        const value = (row.setting_value as { value: any })?.value;
        
        if (key in settingsMap && value !== undefined) {
          (settingsMap as any)[key] = value;
        }
      });

      return settingsMap;
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: keyof AdSettings; value: any }) => {
      const { error } = await supabase
        .from("ad_settings")
        .update({ setting_value: { value } })
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-settings"] });
      toast.success("Configuração salva");
    },
    onError: (error) => {
      console.error("Error updating setting:", error);
      toast.error("Erro ao salvar configuração");
    },
  });

  return {
    settings: settings ?? defaultSettings,
    isLoading,
    updateSetting: updateSetting.mutate,
    isUpdating: updateSetting.isPending,
  };
};
