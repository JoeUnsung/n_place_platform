import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useKeywords } from '@/hooks/useKeywords';
import { toast } from 'sonner';
import type { Store } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function KeywordSetupPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [collectingId, setCollectingId] = useState<string | null>(null);

  const { keywords, loading, error, createKeyword, updateKeyword, deleteKeyword, collectKeyword } =
    useKeywords(storeId!);

  const fetchStore = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stores/${storeId}`);
      if (res.ok) setStore(await res.json());
    } catch {
      /* ignore */
    }
  }, [storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setSubmitting(true);
    setActionError(null);
    try {
      await createKeyword(newKeyword.trim());
      setNewKeyword('');
      toast.success('키워드가 추가되었습니다.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '키워드 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (keywordId: string, field: 'is_active' | 'alert_enabled', value: boolean) => {
    try {
      await updateKeyword(keywordId, { [field]: !value });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '수정에 실패했습니다.');
    }
  };

  const handleDelete = async (keywordId: string) => {
    try {
      await deleteKeyword(keywordId);
      toast.success('키워드가 삭제되었습니다.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleCollect = async (keywordId: string) => {
    setCollectingId(keywordId);
    try {
      await collectKeyword(keywordId);
      toast.success('수집이 완료되었습니다.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '수집에 실패했습니다.');
    } finally {
      setCollectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold">키워드 관리</h2>
          {store && (
            <p className="text-sm text-muted-foreground">
              {store.name || store.naver_place_id} {store.address && `- ${store.address}`}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>키워드 추가</CardTitle>
          <CardDescription>추적할 검색 키워드를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <Input
              placeholder="예: 강남 카페"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              disabled={submitting}
              className="flex-1"
            />
            <Button type="submit" disabled={submitting || !newKeyword.trim()}>
              {submitting ? '추가 중...' : '추가'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">불러오는 중...</p>
        </div>
      ) : keywords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="font-medium">등록된 키워드가 없습니다</p>
            <p className="text-sm text-muted-foreground">위 폼에서 키워드를 추가해보세요</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {keywords.map((kw) => (
              <div key={kw.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <Link
                    to={`/keywords/${kw.id}/history`}
                    className="font-medium hover:underline"
                  >
                    {kw.keyword}
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">활성</span>
                    <Switch
                      checked={kw.is_active}
                      onCheckedChange={() => handleToggle(kw.id, 'is_active', kw.is_active)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">알림</span>
                    <Switch
                      checked={kw.alert_enabled}
                      onCheckedChange={() => handleToggle(kw.id, 'alert_enabled', kw.alert_enabled)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCollect(kw.id)}
                    disabled={collectingId === kw.id}
                  >
                    {collectingId === kw.id ? '수집 중...' : '수동 수집'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(kw.id)}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
