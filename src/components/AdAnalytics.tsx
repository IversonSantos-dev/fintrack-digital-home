import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart3, MousePointer, Eye, X } from "lucide-react";

interface AdStats {
  ad_id: string;
  ad_variant: string;
  impressions: number;
  clicks: number;
  dismisses: number;
  ctr: number;
}

interface DailyStats {
  date: string;
  impressions: number;
  clicks: number;
}

export const AdAnalytics = () => {
  const [adStats, setAdStats] = useState<AdStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totals, setTotals] = useState({ impressions: 0, clicks: 0, dismisses: 0, ctr: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all analytics data
      const { data, error } = await supabase
        .from("ad_analytics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Calculate stats per ad
        const statsMap = new Map<string, { impressions: number; clicks: number; dismisses: number }>();
        
        data.forEach((item: any) => {
          const key = `${item.ad_id}-${item.ad_variant}`;
          const current = statsMap.get(key) || { impressions: 0, clicks: 0, dismisses: 0 };
          
          if (item.event_type === "impression") current.impressions++;
          if (item.event_type === "click") current.clicks++;
          if (item.event_type === "dismiss") current.dismisses++;
          
          statsMap.set(key, current);
        });

        const adStatsArray: AdStats[] = [];
        statsMap.forEach((stats, key) => {
          const [ad_id, ad_variant] = key.split("-");
          adStatsArray.push({
            ad_id,
            ad_variant,
            ...stats,
            ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0,
          });
        });

        setAdStats(adStatsArray);

        // Calculate totals
        const totalImpressions = adStatsArray.reduce((sum, s) => sum + s.impressions, 0);
        const totalClicks = adStatsArray.reduce((sum, s) => sum + s.clicks, 0);
        const totalDismisses = adStatsArray.reduce((sum, s) => sum + s.dismisses, 0);
        
        setTotals({
          impressions: totalImpressions,
          clicks: totalClicks,
          dismisses: totalDismisses,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        });

        // Calculate daily stats (last 7 days)
        const dailyMap = new Map<string, { impressions: number; clicks: number }>();
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        data
          .filter((item: any) => new Date(item.created_at) >= last7Days)
          .forEach((item: any) => {
            const date = new Date(item.created_at).toLocaleDateString("pt-BR");
            const current = dailyMap.get(date) || { impressions: 0, clicks: 0 };
            
            if (item.event_type === "impression") current.impressions++;
            if (item.event_type === "click") current.clicks++;
            
            dailyMap.set(date, current);
          });

        const dailyArray: DailyStats[] = [];
        dailyMap.forEach((stats, date) => {
          dailyArray.push({ date, ...stats });
        });
        
        setDailyStats(dailyArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
    } catch (error) {
      console.error("Error fetching ad analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Analytics de Anúncios</h3>
      
      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Impressões</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.impressions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MousePointer className="h-4 w-4" />
              <span className="text-xs">Cliques</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.clicks}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <X className="h-4 w-4" />
              <span className="text-xs">Fechados</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.dismisses}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">CTR</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totals.ctr.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-ad stats */}
      {adStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desempenho por Anúncio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground text-sm">{stat.ad_id}</p>
                    <p className="text-xs text-muted-foreground capitalize">{stat.ad_variant}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <Eye className="h-3 w-3 inline mr-1" />
                      {stat.impressions}
                    </span>
                    <span className="text-muted-foreground">
                      <MousePointer className="h-3 w-3 inline mr-1" />
                      {stat.clicks}
                    </span>
                    <span className="text-primary font-medium">
                      {stat.ctr.toFixed(1)}% CTR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily stats */}
      {dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{stat.date}</span>
                  <div className="flex gap-4">
                    <span>{stat.impressions} impressões</span>
                    <span>{stat.clicks} cliques</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {adStats.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum dado de anúncios ainda. Os dados aparecerão quando usuários interagirem com os anúncios.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
