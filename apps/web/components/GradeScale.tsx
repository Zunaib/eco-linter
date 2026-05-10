const grades = [
  { grade: 'A+', range: '95–100', label: 'Exemplary',  note: 'Industry best practice',          color: '#22c55e', textClass: 'text-green-400',  bgClass: 'bg-green-500/10',  borderClass: 'border-green-500/30' },
  { grade: 'A',  range: '85–94',  label: 'Excellent',  note: 'Minor improvements possible',      color: '#86efac', textClass: 'text-green-300',  bgClass: 'bg-green-400/10',  borderClass: 'border-green-400/30' },
  { grade: 'B',  range: '70–84',  label: 'Good',       note: 'Some inefficiencies to address',   color: '#facc15', textClass: 'text-yellow-400', bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/30' },
  { grade: 'C',  range: '55–69',  label: 'Fair',       note: 'Several high-impact issues',       color: '#fb923c', textClass: 'text-orange-400', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30' },
  { grade: 'D',  range: '40–54',  label: 'Poor',       note: 'Significant work needed',          color: '#f87171', textClass: 'text-red-400',    bgClass: 'bg-red-500/10',    borderClass: 'border-red-500/30' },
  { grade: 'F',  range: '0–39',   label: 'Critical',   note: 'Major inefficiencies throughout',  color: '#ef4444', textClass: 'text-red-500',    bgClass: 'bg-red-600/10',    borderClass: 'border-red-600/30' },
];

export default function GradeScale() {
  return (
    <section className="py-24 px-6 border-t border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-green-400 text-sm font-semibold tracking-widest uppercase mb-3">Carbon Score</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">From F to A+</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Every project gets a grade from 0–100 with an estimated CO₂e per build.
            Set a minimum score in CI and fail the build if it drops.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.map(g => (
            <div key={g.grade} className={`rounded-xl border ${g.borderClass} ${g.bgClass} p-5 flex items-center gap-4`}>
              <div className={`text-4xl font-black ${g.textClass} w-12 text-center flex-shrink-0`}>{g.grade}</div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-zinc-100">{g.label}</span>
                  <span className="text-xs font-mono text-zinc-600">{g.range}</span>
                </div>
                <p className="text-xs text-zinc-500">{g.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CO2 estimate note */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex gap-4 items-start">
          <svg className="text-green-400 flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="text-sm text-zinc-300 font-medium mb-1">About CO₂e estimates</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded">estimatedCO2ePerBuild</code> figure
              uses a simplified model based on instruction weight proxies (cyclomatic complexity, loop estimates),
              dependency bundle size, and your configured regional carbon intensity (gCO₂/kWh).
              It&apos;s explicitly an <em>estimate</em>, not a measurement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
