import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Trophy, GraduationCap, LogOut, Code2 } from 'lucide-react';
// import { View } from '../types';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
  isMobileOpen: boolean;
  closeMobile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, closeMobile, onLogout }) => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', label: 'Главная', icon: LayoutDashboard },
    { href: '#', label: 'Practice', icon: BookOpen },
   
  ];

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}
      
      <aside className={twMerge(
        `fixed top-0 left-0 z-50 h-screen w-64
         bg-[var(--team-surface)]
         border-r border-black/10 dark:border-white/10
         transition-transform duration-300 ease-out`,
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 flex items-center gap-3 rounded-full bg-[var(--background)] px-3 py-2 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
              <Code2 size={20} />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-[var(--foreground)] md:text-base">
              Marketing Logo
            </h1>
          </div>

          <nav className="flex-1 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  className={`
                    flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-colors
                    ${isActive 
                      ? 'bg-[var(--design-btn)] text-[var(--foreground)]' 
                      : 'text-[var(--design-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-black/10 pt-4 dark:border-white/10">
             <button 
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--design-muted)] transition-colors hover:bg-red-100/70 hover:text-red-600 dark:hover:bg-red-900/30"
             >
                <LogOut size={18} />
                Sign Out
             </button>
          </div>
        </div>
      </aside>
    </>
  );
};