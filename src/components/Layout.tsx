import { type ReactNode } from 'react';
import { ToastContainer } from './Toast';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-full flex flex-col bg-[var(--page-bg)]">
      <main className="flex-1 overflow-auto">{children}</main>
      <ToastContainer />
    </div>
  );
}
