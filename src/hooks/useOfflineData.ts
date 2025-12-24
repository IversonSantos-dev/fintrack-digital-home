import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CACHE_KEY_PREFIX = "fintrack_cache_";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

interface CachedData<T> {
  data: T;
  timestamp: number;
}

export function useOfflineData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const cacheKey = `${CACHE_KEY_PREFIX}${user?.id}_${key}`;

  // Load from cache
  const loadFromCache = (): T | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: CachedData<T> = JSON.parse(cached);
        const isExpired = Date.now() - parsed.timestamp > CACHE_EXPIRY;
        if (!isExpired) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.error("Error loading from cache:", error);
    }
    return null;
  };

  // Save to cache
  const saveToCache = (data: T) => {
    try {
      const cacheData: CachedData<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  // Fetch data
  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try to load from cache first if offline
    if (!navigator.onLine) {
      const cachedData = loadFromCache();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    try {
      const result = await fetchFn();
      setData(result);
      saveToCache(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to cache on error
      const cachedData = loadFromCache();
      if (cachedData) {
        setData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, [user, ...dependencies]);

  return { data, loading, isOffline, refetch: fetchData };
}

// Pre-cache essential data for offline use
export function useCacheEssentialData() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !navigator.onLine) return;

    const cacheData = async () => {
      try {
        // Cache accounts
        const { data: accounts } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id);
        if (accounts) {
          localStorage.setItem(
            `${CACHE_KEY_PREFIX}${user.id}_accounts`,
            JSON.stringify({ data: accounts, timestamp: Date.now() })
          );
        }

        // Cache categories
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id);
        if (categories) {
          localStorage.setItem(
            `${CACHE_KEY_PREFIX}${user.id}_categories`,
            JSON.stringify({ data: categories, timestamp: Date.now() })
          );
        }

        // Cache recent transactions (last 100)
        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(100);
        if (transactions) {
          localStorage.setItem(
            `${CACHE_KEY_PREFIX}${user.id}_transactions`,
            JSON.stringify({ data: transactions, timestamp: Date.now() })
          );
        }

        // Cache profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) {
          localStorage.setItem(
            `${CACHE_KEY_PREFIX}${user.id}_profile`,
            JSON.stringify({ data: profile, timestamp: Date.now() })
          );
        }
      } catch (error) {
        console.error("Error caching essential data:", error);
      }
    };

    cacheData();
  }, [user]);
}
