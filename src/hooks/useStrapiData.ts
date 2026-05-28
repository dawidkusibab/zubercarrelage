import { useState, useEffect } from 'react';
import type { StrapiResponse } from '../types/strapi';

const STRAPI_BASE_URL = process.env.GATSBY_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.GATSBY_STRAPI_TOKEN ?? '';

export interface UseStrapiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useStrapiData<T>(
  endpoint: string,
  mapper?: (raw: T, baseUrl: string) => T
): UseStrapiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch(`${STRAPI_BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
        });
        if (!response.ok) {
          throw new Error(`Strapi responded with status ${response.status}`);
        }
        const json = (await response.json()) as StrapiResponse<T>;
        if (json.data === null) {
          throw new Error(`Strapi returned null data for endpoint: ${endpoint}`);
        }
        if (!cancelled) {
          setData(mapper ? mapper(json.data, STRAPI_BASE_URL) : json.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error fetching Strapi data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchData();
    return () => { cancelled = true; };
    // mapper is expected to be a stable module-level function reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, mapper]);

  return { data, loading, error };
}

export default useStrapiData;
