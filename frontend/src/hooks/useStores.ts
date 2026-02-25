import { useState, useEffect, useCallback } from 'react';
import type { Store, DashboardStore } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stores`);
      if (!res.ok) throw new Error('매장 목록을 불러오지 못했습니다.');
      const data = await res.json();
      setStores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStore = useCallback(async (naverPlaceId: string) => {
    setError(null);
    const res = await fetch(`${API_BASE}/api/stores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ naver_place_id: naverPlaceId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.detail || '매장 등록에 실패했습니다.');
    }
    const store: Store = await res.json();
    setStores((prev) => [...prev, store]);
    return store;
  }, []);

  const deleteStore = useCallback(async (storeId: string) => {
    const res = await fetch(`${API_BASE}/api/stores/${storeId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('매장 삭제에 실패했습니다.');
    setStores((prev) => prev.filter((s) => s.id !== storeId));
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return { stores, loading, error, fetchStores, createStore, deleteStore };
}

export function useDashboard() {
  const [stores, setStores] = useState<DashboardStore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`);
      if (!res.ok) throw new Error('대시보드 데이터를 불러오지 못했습니다.');
      const data = await res.json();
      setStores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { stores, loading, error, fetchDashboard };
}
