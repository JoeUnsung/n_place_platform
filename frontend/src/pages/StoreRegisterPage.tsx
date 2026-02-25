import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <h2 className="mb-6 text-2xl font-bold">매장 등록</h2>

      <Card>
        <CardHeader>
          <CardTitle>네이버 플레이스 매장 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="naverPlaceId">네이버 플레이스 ID</Label>
              <Input
                id="naverPlaceId"
                placeholder="네이버 플레이스 ID를 입력하세요"
                value={naverPlaceId}
                onChange={(e) => setNaverPlaceId(e.target.value)}
                disabled={submitting}
              />
              <p className="text-sm text-muted-foreground">
                네이버 플레이스 URL에서 확인할 수 있는 매장 고유 ID입니다.
              </p>
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
