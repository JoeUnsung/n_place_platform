import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStores } from '@/hooks/useStores';

export function StoreRegisterPage() {
  const [naverPlaceId, setNaverPlaceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createStore } = useStores();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naverPlaceId.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const store = await createStore(naverPlaceId.trim());
      navigate(`/stores/${store.id}/keywords`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold">매장 등록</h2>
          <p className="text-sm text-muted-foreground">네이버 플레이스 매장을 등록하고 순위 추적을 시작하세요</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>네이버 플레이스 매장 등록</CardTitle>
          <CardDescription>네이버 플레이스 URL 또는 ID를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="naverPlaceId">네이버 플레이스 ID</Label>
              <Input
                id="naverPlaceId"
                placeholder="예: 1234567890"
                value={naverPlaceId}
                onChange={(e) => setNaverPlaceId(e.target.value)}
                disabled={submitting}
              />
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                네이버 플레이스 URL에서 확인할 수 있는 매장 고유 ID입니다.
                <br />
                예: https://map.naver.com/v5/entry/place/<strong>1234567890</strong>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={submitting || !naverPlaceId.trim()} className="w-full">
              {submitting ? '등록 중...' : '매장 등록'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
