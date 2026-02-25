import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { RankingSnapshot } from '@/types';

interface RankChartProps {
  data: RankingSnapshot[];
}

export function RankChart({ data }: RankChartProps) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.collected_at).getTime() - new Date(b.collected_at).getTime(),
  );

  const chartData = sorted
    .filter((d) => d.rank_position !== null)
    .map((d) => ({
      date: new Date(d.collected_at).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      }),
      rank: d.rank_position,
      collected_at: d.collected_at,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" fontSize={12} stroke="hsl(var(--muted-foreground))" />
        <YAxis
          reversed
          domain={['auto', 'auto']}
          fontSize={12}
          stroke="hsl(var(--muted-foreground))"
          label={{ value: '순위', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
        />
        <Tooltip
          formatter={(value) => [`${value}위`, '순위']}
          labelFormatter={(label) => String(label)}
          contentStyle={{
            borderRadius: '0.5rem',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        />
        <Line
          type="monotone"
          dataKey="rank"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 3, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
