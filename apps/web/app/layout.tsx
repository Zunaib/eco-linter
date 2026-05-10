import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'eco-linter — Carbon-aware code analysis for TypeScript',
  description:
    'Static analysis tool that measures and reports the energy efficiency of your TypeScript/JavaScript codebase. Get a Carbon Score for every build.',
  keywords: ['eslint', 'linter', 'carbon', 'sustainability', 'typescript', 'performance', 'green software'],
  openGraph: {
    title: 'eco-linter',
    description: 'Carbon-aware code analysis for TypeScript/JavaScript',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
