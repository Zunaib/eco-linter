import CopyButton from './CopyButton';

const SCORE = 74;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DASH = (SCORE / 100) * CIRCUMFERENCE;

const pillars = [
  { label: 'Loop Efficiency',        score: 91, color: '#22c55e' },
  { label: 'Dependency Health',      score: 61, color: '#fb923c' },
  { label: 'Tree-Shakability',       score: 70, color: '#facc15' },
  { label: 'Algorithmic Complexity', score: 88, color: '#22c55e' },
];

function pillarColor(score: number) {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#facc15';
  if (score >= 55) return '#fb923c';
  return '#f87171';
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-14 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 items-center py-24">
        {/* Left — copy */}
        <div className="flex flex-col gap-6">
          <div className="badge border-green-500/30 bg-green-500/10 text-green-400 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            v1.0.0 — now available
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            Code that&apos;s fast,<br />
            lean, <span className="text-gradient">and green.</span>
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-lg">
            Static analysis for TypeScript and JavaScript that measures
            energy efficiency at the code level — not just the infrastructure level.
            Get a <strong className="text-zinc-200">Carbon Score</strong> for every build.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <CopyButton text="npx eco-linter" />
            <a
              href="#quick-start"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-zinc-100 transition-all"
            >
              Read the docs
            </a>
          </div>

          <p className="text-xs text-zinc-600">
            Works with TypeScript · JavaScript · ESLint · CI/CD
          </p>
        </div>

        {/* Right — Score card */}
        <div className="relative">
          {/* Glow behind card */}
          <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-2xl scale-75" />

          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
            {/* Terminal top bar */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-800">
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="ml-2 text-xs text-zinc-600 font-mono">eco-linter v1.0.0</span>
            </div>

            {/* Score ring + grade */}
            <div className="flex items-center gap-8 mb-8">
              <div className="relative flex-shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* Track */}
                  <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#27272a" strokeWidth="8" />
                  {/* Score arc */}
                  <circle
                    cx="60" cy="60" r={RADIUS}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${DASH} ${CIRCUMFERENCE}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                    className="score-arc"
                    style={{ strokeDashoffset: CIRCUMFERENCE - DASH }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-400">{SCORE}</span>
                  <span className="text-xs text-zinc-500">/ 100</span>
                </div>
              </div>

              <div>
                <div className="text-3xl font-bold text-zinc-100 mb-1">Grade B</div>
                <div className="text-sm text-zinc-500 mb-3">Carbon Score</div>
                <div className="text-xs text-green-400 font-mono bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
                  ~0.8g CO₂e / build
                </div>
              </div>
            </div>

            {/* Pillar bars */}
            <div className="space-y-3">
              {pillars.map(p => {
                const c = pillarColor(p.score);
                return (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 w-36 truncate">{p.label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p.score}%`, background: c }}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold w-6 text-right" style={{ color: c }}>
                      {p.score}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Violation summary */}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center gap-4 text-xs font-mono">
              <span className="text-red-400">3 errors</span>
              <span className="text-yellow-400">4 warnings</span>
              <span className="text-blue-400">2 info</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
        <span className="text-xs">scroll to explore</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
