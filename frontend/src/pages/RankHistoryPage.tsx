import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RankChart } from '@/components/RankChart';
import { useRankings } from '@/hooks/useRankings';
import type { TrackedKeyword } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function RankHistoryPage() {
  const { keywordId } = useParams<{ keywordId: string }>();
  const [keyword, setKeyword] = useState<TrackedKeyword | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { rankings, loading, error, fetchRankings } = useRankings(keywordId!);

  const fetchKeyword = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/keywords/${keywordId}`);
      if (res.ok) setKeyword(await res.json());
    } catch {
      /* ignore */
    }
  }, [keywordId]);

  useEffect(() => {
    fetchKeyword();
    fetchRankings();
  }, [fetchKeyword, fetchRankings]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRankings(fromDate || undefined, toDate || undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold">순위 히스토리</h2>
          {keyword && (
            <p className="text-sm text-muted-foreground">키워드: {keyword.keyword}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기간 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFilter} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">시작일</Label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">종료일</Label>
              <Input
                id="to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button type="submit">조회</Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">불러오는 중...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>순위 차트</CardTitle>
            </CardHeader>
            <CardContent>
              <RankChart data={rankings} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>상세 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              {rankings.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <p className="font-medium">데이터가 없습니다</p>
                  <p className="text-sm text-muted-foreground">아직 수집된 순위 데이터가 없습니다</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>수집 시각</TableHead>
                        <TableHead>순위</TableHead>
                        <TableHead>총 결과</TableHead>
                        <TableHead>방문자 수</TableHead>
                        <TableHead>블로그 리뷰</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm">
                            {new Date(r.collected_at).toLocaleString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            {r.rank_position !== null ? (
                              <span className="font-semibold">{r.rank_position}위</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{r.total_results?.toLocaleString() ?? '-'}</TableCell>
                          <TableCell>{r.visitor_count?.toLocaleString() ?? '-'}</TableCell>
                          <TableCell>{r.blog_review_count?.toLocaleString() ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
