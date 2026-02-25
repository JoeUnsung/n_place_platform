import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RankBadge } from '@/components/RankBadge';
import { useDashboard } from '@/hooks/useStores';

export function DashboardPage() {
  const { stores, loading, error } = useDashboard();

  if (loading) {
    return <div className="text-muted-foreground">불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">등록된 매장이 없습니다.</p>
        <Link to="/stores/register">
          <Button>매장 등록하기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">대시보드</h2>
        <Link to="/stores/register">
          <Button>매장 등록</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Card key={store.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{store.name || store.naver_place_id}</CardTitle>
              {store.category && (
                <Badge variant="secondary" className="w-fit">
                  {store.category}
                </Badge>
              )}
              {store.address && (
                <p className="text-sm text-muted-foreground">{store.address}</p>
              )}
            </CardHeader>
            <CardContent>
              {store.keywords.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 키워드가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {store.keywords.map((kw) => (
                    <div key={kw.id} className="flex items-center justify-between">
                      <Link
                        to={`/keywords/${kw.id}/history`}
                        className="text-sm font-medium hover:underline"
                      >
                        {kw.keyword}
                      </Link>
                      <RankBadge rank={kw.latest_rank} change={kw.rank_change} />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link to={`/stores/${store.id}/keywords`}>
                  <Button variant="outline" size="sm" className="w-full">
                    키워드 관리
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
