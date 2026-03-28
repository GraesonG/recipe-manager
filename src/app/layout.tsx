import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components';
import { MealPrepProvider } from '@/lib/meal-prep-context';

export const metadata: Metadata = {
  title: 'Recipe Manager',
  description: 'A personal recipe manager with meal prep and Google Keep integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-apple-bg">
        <MealPrepProvider>
          <div className="relative min-h-screen">
            {/* Background gradient for depth */}
            <div className="fixed inset-0 bg-gradient-to-br from-apple-gray-6/50 via-apple-bg to-apple-bg pointer-events-none" />
            
            {/* Header */}
            <Header />
            
            {/* Main content with padding for fixed header */}
            <main className="relative z-10 pt-20">
              {children}
            </main>
          </div>
        </MealPrepProvider>
      </body>
    </html>
  );
}
