import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings, Percent, Clock, ToggleLeft } from "lucide-react";
import { useAdSettings } from "@/hooks/useAdSettings";

export const AdSettingsPanel = () => {
  const { settings, isLoading, updateSetting, isUpdating } = useAdSettings();
  
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleRatioChange = (value: number[]) => {
    setLocalSettings(prev => ({ ...prev, internal_ad_ratio: value[0] }));
  };

  const handleSaveRatio = () => {
    updateSetting({ key: "internal_ad_ratio", value: localSettings.internal_ad_ratio });
  };

  const handleToggle = (key: "adsense_enabled" | "popup_enabled", value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    updateSetting({ key, value });
  };

  const handleSlotChange = (key: "adsense_slot_horizontal" | "adsense_slot_sidebar", value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSlot = (key: "adsense_slot_horizontal" | "adsense_slot_sidebar") => {
    updateSetting({ key, value: localSettings[key] });
  };

  const handleDelayChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    setLocalSettings(prev => ({ ...prev, popup_delay_seconds: numValue }));
  };

  const handleSaveDelay = () => {
    updateSetting({ key: "popup_delay_seconds", value: localSettings.popup_delay_seconds });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Anúncios
        </CardTitle>
        <CardDescription>
          Controle a proporção e comportamento dos anúncios no app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ad Ratio Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Proporção de Anúncios Internos
            </Label>
            <span className="text-sm font-medium text-muted-foreground">
              {localSettings.internal_ad_ratio}% internos / {100 - localSettings.internal_ad_ratio}% AdSense
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[localSettings.internal_ad_ratio]}
              onValueChange={handleRatioChange}
              max={100}
              step={5}
              className="flex-1"
            />
            <Button 
              size="sm" 
              onClick={handleSaveRatio}
              disabled={isUpdating || localSettings.internal_ad_ratio === settings.internal_ad_ratio}
            >
              Salvar
            </Button>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>100% AdSense</span>
            <span>100% Internos</span>
          </div>
        </div>

        {/* AdSense Toggle */}
        <div className="flex items-center justify-between py-2 border-t">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4" />
              AdSense Ativado
            </Label>
            <p className="text-sm text-muted-foreground">
              Exibir anúncios do Google AdSense
            </p>
          </div>
          <Switch
            checked={localSettings.adsense_enabled}
            onCheckedChange={(value) => handleToggle("adsense_enabled", value)}
            disabled={isUpdating}
          />
        </div>

        {/* AdSense Slots */}
        {localSettings.adsense_enabled && (
          <div className="space-y-4 pl-6 border-l-2 border-muted">
            <div className="space-y-2">
              <Label>Slot AdSense Horizontal</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ca-pub-xxxxxxx"
                  value={localSettings.adsense_slot_horizontal}
                  onChange={(e) => handleSlotChange("adsense_slot_horizontal", e.target.value)}
                />
                <Button 
                  size="sm" 
                  onClick={() => handleSaveSlot("adsense_slot_horizontal")}
                  disabled={isUpdating || localSettings.adsense_slot_horizontal === settings.adsense_slot_horizontal}
                >
                  Salvar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slot AdSense Sidebar</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ca-pub-xxxxxxx"
                  value={localSettings.adsense_slot_sidebar}
                  onChange={(e) => handleSlotChange("adsense_slot_sidebar", e.target.value)}
                />
                <Button 
                  size="sm" 
                  onClick={() => handleSaveSlot("adsense_slot_sidebar")}
                  disabled={isUpdating || localSettings.adsense_slot_sidebar === settings.adsense_slot_sidebar}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Popup Settings */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <ToggleLeft className="h-4 w-4" />
                Popup de Anúncio
              </Label>
              <p className="text-sm text-muted-foreground">
                Exibir popup promocional para usuários free
              </p>
            </div>
            <Switch
              checked={localSettings.popup_enabled}
              onCheckedChange={(value) => handleToggle("popup_enabled", value)}
              disabled={isUpdating}
            />
          </div>

          {localSettings.popup_enabled && (
            <div className="space-y-2 pl-6 border-l-2 border-muted">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Delay do Popup (segundos)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={5}
                  max={300}
                  value={localSettings.popup_delay_seconds}
                  onChange={(e) => handleDelayChange(e.target.value)}
                  className="w-24"
                />
                <Button 
                  size="sm" 
                  onClick={handleSaveDelay}
                  disabled={isUpdating || localSettings.popup_delay_seconds === settings.popup_delay_seconds}
                >
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
