import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const NAV_ITEMS = [
  { to: '/', label: '대시보드', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/stores/register', label: '매장 등록', icon: 'M12 4v16m8-8H4' },
  { to: '/keywords', label: '키워드순위 추적', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 flex-shrink-0 border-r bg-card lg:block">
        <div className="flex h-14 items-center border-b px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">/nplace.</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b bg-card px-6 lg:hidden">
          <Link to="/" className="text-lg font-bold text-primary">/nplace.</Link>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
}
