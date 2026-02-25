import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RankBadge } from '@/components/RankBadge';
import { AddKeywordDialog } from '@/components/AddKeywordDialog';
import { useDashboard, useStores } from '@/hooks/useStores';
import { toast } from 'sonner';
import type { DashboardStore } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

function StoreCard({ store, onCollectAll }: { store: DashboardStore; onCollectAll: (storeId: string) => void }) {
  const activeCount = store.keywords.filter((k) => k.is_active).length;

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
            {(store.name || store.naver_place_id).charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <Link to={`/stores/${store.id}/keywords`} className="font-semibold hover:underline">
                {store.name || store.naver_place_id}
              </Link>
              <Badge className="rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/10">
                {activeCount}개 추적중
              </Badge>
            </div>
            {store.category && (
              <p className="text-xs text-muted-foreground mt-0.5">{store.category}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
            <Link to={`/stores/${store.id}/keywords`}>
              <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              설정
            </Link>
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => onCollectAll(store.id)}
          >
            <svg className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            전체 수집
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        {store.keywords.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            등록된 키워드가 없습니다.
            <Link to={`/stores/${store.id}/keywords`} className="ml-1 text-primary hover:underline font-medium">
              키워드 추가
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {store.keywords.map((kw) => (
              <div key={kw.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-5 min-w-0">
                  <RankBadge rank={kw.latest_rank} change={kw.rank_change} size="lg" />
                  <div className="min-w-0">
                    <Link
                      to={`/keywords/${kw.id}/history`}
                      className="text-sm font-semibold hover:text-primary transition-colors"
                    >
                      {kw.keyword}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        1회/일
                      </span>
                      {kw.latest_collected_at && (
                        <>
                          <span className="text-border">|</span>
                          <span>{new Date(kw.latest_collected_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 수집</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {kw.latest_visitor_count !== null && kw.latest_visitor_count !== undefined && (
                    <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5">
                      <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs font-medium">{kw.latest_visitor_count.toLocaleString()}</span>
                    </div>
                  )}
                  {kw.latest_blog_review_count !== null && kw.latest_blog_review_count !== undefined && (
                    <div className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5">
                      <svg className="h-3.5 w-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="text-xs font-medium">{kw.latest_blog_review_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { stores, loading, error, fetchDashboard } = useDashboard();
  const { stores: storeList } = useStores();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoTrack, setAutoTrack] = useState(true);

  const handleCollectAll = async (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    const activeKeywords = store?.keywords.filter((k) => k.is_active) ?? [];
    if (activeKeywords.length === 0) {
      toast.error('수집할 키워드가 없습니다.');
      return;
    }

    let success = 0;
    for (const kw of activeKeywords) {
      try {
        const res = await fetch(`${API_BASE}/api/keywords/${kw.id}/collect`, { method: 'POST' });
        if (res.ok) success++;
      } catch {
        /* continue */
      }
    }
    toast.success(`전체 수집 완료 - ${success}/${activeKeywords.length}개 키워드의 지표가 수집되었습니다`);
    fetchDashboard();
  };

  const handleAddKeyword = async (storeId: string, keyword: string, collectionTime: string, alertEnabled: boolean) => {
    const res = await fetch(`${API_BASE}/api/stores/${storeId}/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, collection_time: collectionTime, alert_enabled: alertEnabled }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.detail || '키워드 추가에 실패했습니다.');
      throw new Error('failed');
    }
    toast.success('키워드가 추가되었습니다.');
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">키워드순위 추적</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            매장별 주요 키워드의 순위 변화와 리뷰 수를 자동으로 추적하고 알림을 받을 수 있습니다
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm">
            <span className="text-sm font-medium">자동 추적</span>
            <Switch checked={autoTrack} onCheckedChange={setAutoTrack} />
          </div>
          <Button onClick={() => setDialogOpen(true)} className="shadow-sm">
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            추적 추가
          </Button>
        </div>
      </div>

      {stores.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">등록된 매장이 없습니다</p>
              <p className="mt-1 text-sm text-muted-foreground">매장을 등록하고 키워드 순위 추적을 시작하세요</p>
            </div>
            <Link to="/stores/register">
              <Button size="lg">매장 등록하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} onCollectAll={handleCollectAll} />
          ))}
        </div>
      )}

      <AddKeywordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stores={storeList}
        onAdd={handleAddKeyword}
      />
    </div>
  );
}
