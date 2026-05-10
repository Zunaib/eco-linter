const links = [
  {
    heading: 'Package',
    items: [
      { label: 'npm — eco-linter', href: 'https://www.npmjs.com/package/eco-linter' },
      { label: 'npm — ESLint plugin', href: 'https://www.npmjs.com/package/@eco-linter/eslint-plugin' },
      { label: 'Changelog', href: 'https://github.com/zunaibimtiaz/eco-linter/releases' },
    ],
  },
  {
    heading: 'Docs',
    items: [
      { label: 'Quick Start', href: '#quick-start' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Rule reference', href: 'https://github.com/zunaibimtiaz/eco-linter#rules' },
      { label: 'Config options', href: 'https://github.com/zunaibimtiaz/eco-linter#configuration' },
    ],
  },
  {
    heading: 'Community',
    items: [
      { label: 'GitHub', href: 'https://github.com/zunaibimtiaz/eco-linter' },
      { label: 'Issues', href: 'https://github.com/zunaibimtiaz/eco-linter/issues' },
      { label: 'Discussions', href: 'https://github.com/zunaibimtiaz/eco-linter/discussions' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l3 3" />
                <path d="M22 2 12 12" />
              </svg>
              <span className="font-bold text-zinc-100">eco-linter</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Carbon-aware static analysis for TypeScript and JavaScript.
              Measure and reduce your code&apos;s energy footprint — one build at a time.
            </p>
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              MIT License · v1.0.0
            </div>
          </div>

          {/* Link columns */}
          {links.map(col => (
            <div key={col.heading}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {col.items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} eco-linter. Open source under the MIT License.</p>
          <p>
            Built to help developers write{' '}
            <span className="text-green-500">greener</span> software.
          </p>
        </div>
      </div>
    </footer>
  );
}
