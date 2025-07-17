import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export function useFetch<T>(url: string | null, options?: FetchOptions): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!url) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          method: options?.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setState({ data: null, loading: false, error: error.message });
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [url, options?.method, JSON.stringify(options?.body), JSON.stringify(options?.headers)]);

  return state;
}