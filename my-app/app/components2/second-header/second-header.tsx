import React from 'react';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
// import { User } from '../types';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'Student' | 'Teacher';
  rank: number;
  solved: number;
}


interface HeaderProps {
  user: User;
  toggleTheme: () => void;
  isDark: boolean;
  toggleMobileSidebar: () => void;
}

export const SecondHeader: React.FC<HeaderProps> = ({ user, toggleTheme, isDark, toggleMobileSidebar }) => {
  return (
    <header className="sticky top-0 z-30 w-full px-3 pt-3 sm:px-4 md:px-6 md:pt-4">
      <div className="flex h-14 w-full min-w-0 items-center justify-between rounded-2xl border border-black/10 bg-[var(--header-bg)]/90 px-3 shadow-sm backdrop-blur-sm dark:border-white/10 sm:h-16 sm:px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleMobileSidebar}
            className="rounded-md p-2 text-[var(--design-muted)] transition-colors hover:bg-black/5 hover:text-[var(--foreground)] lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--design-muted)]" />
            <input 
              type="text" 
              placeholder="Поиск..." 
              className="
                h-10 w-[190px] rounded-full border border-black/10 bg-[var(--background)] pl-9 pr-4 text-sm text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--design-muted)]
                focus:border-[var(--design-btn)] md:w-64
              "
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button className="relative hidden rounded-full p-2 text-[var(--design-muted)] transition-colors hover:bg-[var(--projects-span-bg)] hover:text-[var(--foreground)] sm:block">
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button 
            onClick={toggleTheme}
            className="rounded-full p-2 text-[var(--design-muted)] transition-colors hover:bg-[var(--projects-span-bg)] hover:text-[var(--foreground)]"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="mx-1 hidden h-6 w-px bg-black/10 dark:bg-white/20 sm:block" />

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-medium leading-tight text-[var(--foreground)]">
                {user.name}
              </div>
              <div className="text-xs text-[var(--design-muted)]">
                {user.role}
              </div>
            </div>
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-9 w-9 rounded-full border border-black/10 bg-[var(--background)] object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};