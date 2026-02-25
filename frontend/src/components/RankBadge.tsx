import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number | null;
  change: number | null;
  size?: 'sm' | 'lg';
}

function getRankStyles(rank: number): { bg: string; text: string; ring: string } {
  if (rank === 1) return { bg: 'bg-amber-400', text: 'text-white', ring: 'ring-amber-200' };
  if (rank === 2) return { bg: 'bg-slate-400', text: 'text-white', ring: 'ring-slate-200' };
  if (rank === 3) return { bg: 'bg-orange-400', text: 'text-white', ring: 'ring-orange-200' };
  if (rank <= 10) return { bg: 'bg-indigo-500', text: 'text-white', ring: 'ring-indigo-200' };
  if (rank <= 30) return { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-100' };
  return { bg: 'bg-slate-50', text: 'text-slate-500', ring: 'ring-slate-50' };
}

export function RankBadge({ rank, change, size = 'sm' }: RankBadgeProps) {
  if (rank === null) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-muted',
        size === 'lg' ? 'h-14 w-14' : 'h-9 w-9',
      )}>
        <span className="text-xs text-muted-foreground">N/A</span>
      </div>
    );
  }

  const styles = getRankStyles(rank);

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn(
        'flex items-center justify-center rounded-full font-bold tabular-nums ring-2',
        styles.bg, styles.text, styles.ring,
        size === 'lg' ? 'h-14 w-14 text-xl' : 'h-9 w-9 text-sm',
      )}>
        {rank}
      </div>
      <div className="flex flex-col items-start">
        <span className={cn(
          'font-medium text-muted-foreground',
          size === 'lg' ? 'text-xs' : 'text-[10px]',
        )}>
          {rank}위
        </span>
        {change !== null && change !== 0 && (
          <span className={cn(
            'inline-flex items-center gap-0.5 font-semibold',
            size === 'lg' ? 'text-xs' : 'text-[10px]',
            change < 0 ? 'text-emerald-600' : 'text-red-500',
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
          <span className={cn(
            'text-muted-foreground',
            size === 'lg' ? 'text-xs' : 'text-[10px]',
          )}>
            --
          </span>
        )}
      </div>
    </div>
  );
}
