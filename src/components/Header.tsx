'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMealPrep } from '@/lib/meal-prep-context';
import { Button } from '@/components/ui';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  showBadge?: boolean;
}

export function Header() {
  const pathname = usePathname();
  const { totalRecipes } = useMealPrep();

  const navItems: NavItem[] = [
    {
      href: '/',
      label: 'Recipes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      href: '/meal-prep',
      label: 'Meal Prep',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      showBadge: true,
    },
  ];

  return (
    <header className="glass-nav">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo / Title */}
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <div className="w-10 h-10 rounded-glass-sm bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center shadow-glass-subtle flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="hidden xs:inline text-xl font-semibold text-apple-label group-hover:text-apple-blue transition-colors truncate">
              Recipe Manager
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 flex-shrink-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'primary' : 'ghost'}
                    size="sm"
                    aria-label={item.label}
                    className={`relative min-h-[44px] ${isActive ? '' : 'text-apple-label-secondary'}`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      <span className="hidden sm:inline">{item.label}</span>
                      {/* Badge for meal prep count */}
                      {item.showBadge && totalRecipes > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-apple-red text-white text-xs font-semibold flex items-center justify-center">
                          {totalRecipes}
                        </span>
                      )}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
