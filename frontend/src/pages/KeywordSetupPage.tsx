import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useKeywords } from '@/hooks/useKeywords';
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
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  const handleCollect = async (keywordId: string) => {
    setCollectingId(keywordId);
    try {
      await collectKeyword(keywordId);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '수집에 실패했습니다.');
    } finally {
      setCollectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">키워드 관리</h2>
        {store && (
          <p className="text-muted-foreground">
            {store.name} {store.address && `- ${store.address}`}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>키워드 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <Input
              placeholder="추적할 키워드를 입력하세요"
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
        <p className="text-muted-foreground">불러오는 중...</p>
      ) : keywords.length === 0 ? (
        <p className="text-muted-foreground">등록된 키워드가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {keywords.map((kw) => (
            <Card key={kw.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/keywords/${kw.id}/history`}
                    className="font-medium hover:underline"
                  >
                    {kw.keyword}
                  </Link>
                  <Badge
                    variant={kw.is_active ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleToggle(kw.id, 'is_active', kw.is_active)}
                  >
                    {kw.is_active ? '활성' : '비활성'}
                  </Badge>
                  <Badge
                    variant={kw.alert_enabled ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleToggle(kw.id, 'alert_enabled', kw.alert_enabled)}
                  >
                    {kw.alert_enabled ? '알림 ON' : '알림 OFF'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCollect(kw.id)}
                    disabled={collectingId === kw.id}
                  >
                    {collectingId === kw.id ? '수집 중...' : '수동 수집'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(kw.id)}
                  >
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
