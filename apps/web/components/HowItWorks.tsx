const pillars = [
  {
    id: '01',
    name: 'Loop Efficiency',
    weight: '30%',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
    desc: 'Detects nested array iterations, DOM queries inside loops, tight polling intervals, and full-array copies where slices would do.',
    rules: ['no-nested-array-iterations', 'no-repeated-dom-queries', 'no-polling-setinterval', 'prefer-for-of-over-foreach'],
  },
  {
    id: '02',
    name: 'Dependency Health',
    weight: '35%',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    desc: 'Flags heavy libraries like moment.js, full lodash imports, and polyfills for APIs that are natively supported in ES2022+.',
    rules: ['no-heavy-moment', 'no-lodash-full-import', 'prefer-native-over-polyfill', 'prefer-date-fns-esm'],
  },
  {
    id: '03',
    name: 'Tree-Shakability',
    weight: '25%',
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    desc: 'Catches side-effect imports, barrel file re-exports, and default exports in library code that prevent dead-code elimination.',
    rules: ['no-side-effect-imports', 'no-barrel-reexports', 'prefer-named-exports'],
  },
  {
    id: '04',
    name: 'Algorithmic Complexity',
    weight: '10%',
    color: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    desc: 'Identifies recursive functions without memoization (exponential complexity) and linear .find() calls inside tight loops.',
    rules: ['no-exponential-recursion', 'prefer-map-over-linear-find'],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-green-400 text-sm font-semibold tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Four pillars. One score.</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            eco-linter analyses your code across four weighted categories and computes a single
            Carbon Score from 0–100. Each pillar targets a different class of energy waste.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {pillars.map(p => (
            <div key={p.id} className={`rounded-xl border ${p.border} ${p.bg} p-6 flex flex-col gap-4`}>
              <div className="flex items-start justify-between">
                <div className={`${p.color} p-2 rounded-lg bg-zinc-900/60`}>{p.icon}</div>
                <div className="text-right">
                  <div className="text-xs text-zinc-600 font-mono">{p.id}</div>
                  <div className="text-xs text-zinc-500 font-semibold">weight {p.weight}</div>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold text-base mb-2 ${p.color}`}>{p.name}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-zinc-800/50">
                {p.rules.map(r => (
                  <code key={r} className="text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    {r}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
