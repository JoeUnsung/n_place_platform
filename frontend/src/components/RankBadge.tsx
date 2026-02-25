import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number | null;
  change: number | null;
  size?: 'sm' | 'lg';
}

function getRankColor(rank: number | null) {
  if (rank === null) return 'text-muted-foreground';
  if (rank <= 3) return 'text-amber-500';
  if (rank <= 10) return 'text-emerald-600';
  return 'text-foreground';
}

export function RankBadge({ rank, change, size = 'sm' }: RankBadgeProps) {
  if (rank === null) {
    return (
      <span className="text-sm text-muted-foreground">-</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        'font-bold tabular-nums',
        getRankColor(rank),
        size === 'lg' ? 'text-3xl' : 'text-lg',
      )}>
        {rank}<span className={cn(size === 'lg' ? 'text-lg' : 'text-xs', 'font-medium')}>위</span>
      </span>
      {change !== null && change !== 0 && (
        <span className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
          change < 0
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-red-50 text-red-500',
        )}>
          {change < 0 ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {Math.abs(change)}
        </span>
      )}
      {change === 0 && (
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          -
        </span>
      )}
    </div>
  );
}
