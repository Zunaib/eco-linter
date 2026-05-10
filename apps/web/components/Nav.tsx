import Link from 'next/link';

export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 2c2.5 2.5 4 6 4 10" />
            <path d="M2 12h10" /><path d="M12 2v10" />
          </svg>
          <span className="font-semibold text-sm tracking-tight">eco-linter</span>
        </div>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="#how-it-works" className="hover:text-zinc-100 transition-colors">How it works</Link>
          <Link href="#rules" className="hover:text-zinc-100 transition-colors">Rules</Link>
          <Link href="#quick-start" className="hover:text-zinc-100 transition-colors">Docs</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/eco-linter/eco-linter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
          </a>
          <a
            href="https://www.npmjs.com/package/eco-linter"
            target="_blank"
            rel="noopener noreferrer"
            className="badge border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors text-xs"
          >
            npm
          </a>
        </div>
      </div>
    </header>
  );
}
