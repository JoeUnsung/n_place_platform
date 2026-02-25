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
      <div>
        <h2 className="text-2xl font-bold">순위 히스토리</h2>
        {keyword && (
          <p className="text-muted-foreground">키워드: {keyword.keyword}</p>
        )}
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
        <p className="text-muted-foreground">불러오는 중...</p>
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
                <p className="text-muted-foreground">데이터가 없습니다.</p>
              ) : (
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
                        <TableCell>
                          {new Date(r.collected_at).toLocaleString('ko-KR')}
                        </TableCell>
                        <TableCell>
                          {r.rank_position !== null ? `${r.rank_position}위` : '-'}
                        </TableCell>
                        <TableCell>{r.total_results ?? '-'}</TableCell>
                        <TableCell>{r.visitor_count ?? '-'}</TableCell>
                        <TableCell>{r.blog_review_count ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
