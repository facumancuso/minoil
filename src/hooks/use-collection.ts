'use client';

import { useEffect, useState } from 'react';
import type { WorkOrder } from '@/lib/types';

export interface UseCollectionResult<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook para obtener datos de MongoDB via API
 * Reemplaza useCollection de Firestore
 */
export function useCollection<T = any>(
  endpoint: string
): UseCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from ${endpoint}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result.data || result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { data, isLoading, error };
}
