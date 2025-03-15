import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';

export const metadata: Metadata = {
  title: 'Admin Portal | Select Sports',
  description: 'Admin Portal for Select Sports Admins and Helpers'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const session = await auth();
  const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <SessionProvider session={session}>
        <KBar>
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
              <Header />
              {/* page main content */}
              {children}
              {/* page main content ends */}
            </SidebarInset>
          </SidebarProvider>
        </KBar>
      </SessionProvider>
    </ThemeProvider>
  );
}
